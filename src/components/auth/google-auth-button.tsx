
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type UserRole = "student" | "tutor";

type GoogleButtonText =
    | "signin_with"
    | "signup_with"
    | "continue_with"
    | "signin";

interface GoogleAuthButtonProps {
    role?: UserRole;
    text?: GoogleButtonText;
}

interface GoogleCredentialResponse {
    credential?: string;
}

interface GoogleButtonOptions {
    theme?: "outline" | "filled_blue" | "filled_black";
    size?: "large" | "medium" | "small";
    text?: GoogleButtonText;
    shape?: "rectangular" | "pill" | "circle" | "square";
    logo_alignment?: "left" | "center";
    width?: number;
}

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (options: {
                        client_id: string;
                        callback: (
                            response: GoogleCredentialResponse
                        ) => void;
                        auto_select?: boolean;
                        cancel_on_tap_outside?: boolean;
                    }) => void;

                    renderButton: (
                        parent: HTMLElement,
                        options: GoogleButtonOptions
                    ) => void;
                };
            };
        };
    }
}

const GOOGLE_CLIENT_ID =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const GOOGLE_AUTH_URL = API_URL.endsWith("/api")
    ? `${API_URL}/auth/google`
    : `${API_URL}/api/auth/google`;

export default function GoogleAuthButton({
    role,
    text = "continue_with",
}: GoogleAuthButtonProps) {
    const router = useRouter();

    const buttonRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            console.error("Google Client ID is missing.");
            return;
        }

        let mounted = true;
        let existingScript: HTMLScriptElement | null = null;
        let newScript: HTMLScriptElement | null = null;

        const initializeGoogle = () => {
            if (
                !mounted ||
                !window.google ||
                !buttonRef.current
            ) {
                return;
            }

            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,

                auto_select: false,
                cancel_on_tap_outside: true,

                callback: async (response) => {
                    if (!response.credential) {
                        toast.error("Google authentication failed.");
                        return;
                    }

                    setLoading(true);

                    try {
                        const requestBody: {
                            credential: string;
                            role?: UserRole;
                        } = {
                            credential: response.credential,
                        };

                        if (role) {
                            requestBody.role = role;
                        }

                        const apiResponse = await fetch(
                            GOOGLE_AUTH_URL, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(requestBody),
                        }
                        );

                        const result = await apiResponse.json();

                        if (!apiResponse.ok || !result.success) {
                            throw new Error(
                                result.message ||
                                "Google authentication failed."
                            );
                        }

                        const { token, user } = result.data;

                        if (!token || !user) {
                            throw new Error(
                                "Invalid authentication response."
                            );
                        }

                        // Preserve existing MentorLagbe storage conventions.

                        localStorage.setItem("token", token);
                        localStorage.setItem(
                            "user",
                            JSON.stringify(user)
                        );

                        localStorage.setItem(
                            "mentorlagbe_token",
                            token
                        );

                        localStorage.setItem(
                            "mentorlagbe_user",
                            JSON.stringify(user)
                        );

                        toast.success(
                            result.message ||
                            "Google sign-in successful!"
                        );

                        // Redirect according to account role.


                        const destination =
                            user.role === "admin"
                                ? "/dashboard/admin"
                                : user.role === "student"
                                    ? "/student/dashboard"
                                    : user.role === "tutor"
                                        ? "/tutor/dashboard"
                                        : "/";


                        router.replace(destination);
                        router.refresh();

                    } catch (error) {
                        const message =
                            error instanceof Error
                                ? error.message
                                : "Google authentication failed.";

                        toast.error(message);

                    } finally {
                        setLoading(false);
                    }
                },
            });

            buttonRef.current.innerHTML = "";

            window.google.accounts.id.renderButton(
                buttonRef.current,
                {
                    theme: "outline",
                    size: "large",
                    text,
                    shape: "pill",
                    logo_alignment: "left",
                    width: 320,
                }
            );
        };

        existingScript = document.getElementById(
            "google-identity-services"
        ) as HTMLScriptElement | null;

        if (window.google) {
            initializeGoogle();

        } else if (existingScript) {
            existingScript.addEventListener(
                "load",
                initializeGoogle
            );

        } else {
            newScript = document.createElement("script");

            newScript.id = "google-identity-services";
            newScript.src =
                "https://accounts.google.com/gsi/client";

            newScript.async = true;
            newScript.defer = true;

            newScript.onload = initializeGoogle;

            newScript.onerror = () => {
                toast.error(
                    "Unable to load Google authentication."
                );
            };

            document.head.appendChild(newScript);
        }

        return () => {
            mounted = false;

            existingScript?.removeEventListener(
                "load",
                initializeGoogle
            );

            if (newScript) {
                newScript.onload = null;
            }
        };
    }, [role, text, router]);

    if (!GOOGLE_CLIENT_ID) {
        return (
            <p className="text-center text-sm text-red-600">
                Google authentication is not configured.
            </p>
        );
    }

    return (
        <div className="flex w-full flex-col items-center gap-2">
            <div
                ref={buttonRef}
                className={
                    loading
                        ? "pointer-events-none opacity-50"
                        : "flex justify-center"
                }
            />

            {loading && (
                <p className="text-sm text-[#63736d]">
                    Connecting to Google...
                </p>
            )}
        </div>
    );
}

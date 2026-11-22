
import Link from "next/link";
import CurrentYear from "@/components/shared/current-year";
import {
    GraduationCap,
    Mail,
    Phone,
    MapPin,
    ArrowUpRight,
} from "lucide-react";

import {
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
    FaXTwitter,
} from "react-icons/fa6";

const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Tuitions", href: "/tuitions" },
    { name: "Pricing & Pro Plans", href: "/#pricing" },
    { name: "How It Works", href: "/#how-it-works" },
];

export function Footer() {
    return (
        <footer className="bg-[#102A20] text-white">

            <div className="site-container py-16 md:py-20">

                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Column 1: Brand */}
                    <div>

                        <Link
                            href="/"
                            className="inline-flex items-center gap-3"
                        >
                            <span className="flex size-11 items-center justify-center rounded-xl bg-white text-[#0F5132]">
                                <GraduationCap size={26} />
                            </span>

                            <span className="text-2xl font-bold tracking-tight">
                                Mentor<span className="text-emerald-400">Lagbe</span>
                            </span>
                        </Link>

                        <p className="mt-6 max-w-xs text-sm leading-7 text-white/65">
                            Connecting students with qualified tutors
                            to make personalized learning accessible,
                            simple and effective.
                        </p>

                        <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-400">
                            <GraduationCap size={18} />
                            Your Learning Journey Starts Here
                        </div>

                    </div>

                    {/* Column 2: Quick Links */}
                    <div>

                        <h3 className="text-lg font-bold">
                            Quick Links
                        </h3>

                        <ul className="mt-6 space-y-4">

                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="inline-flex items-center gap-2 text-sm text-white/65 transition-colors hover:text-emerald-400"
                                    >
                                        <ArrowUpRight size={14} />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}

                        </ul>

                    </div>

                    {/* Column 3: Contact */}
                    <div>

                        <h3 className="text-lg font-bold">
                            Get In Touch
                        </h3>

                        <ul className="mt-6 space-y-5">

                            <li className="flex items-start gap-3">
                                <Mail
                                    size={19}
                                    className="mt-0.5 shrink-0 text-emerald-400"
                                />
                                <div>
                                    <p className="text-xs text-white/45">
                                        Email Address
                                    </p>
                                    <p className="mt-1 text-sm text-white/80">
                                        Add official email
                                    </p>
                                </div>
                            </li>

                            <li className="flex items-start gap-3">
                                <Phone
                                    size={19}
                                    className="mt-0.5 shrink-0 text-emerald-400"
                                />
                                <div>
                                    <p className="text-xs text-white/45">
                                        Phone Number
                                    </p>
                                    <p className="mt-1 text-sm text-white/80">
                                        Add contact number
                                    </p>
                                </div>
                            </li>

                            <li className="flex items-start gap-3">
                                <MapPin
                                    size={19}
                                    className="mt-0.5 shrink-0 text-emerald-400"
                                />
                                <div>
                                    <p className="text-xs text-white/45">
                                        Location
                                    </p>
                                    <p className="mt-1 text-sm text-white/80">
                                        Dhaka, Bangladesh
                                    </p>
                                </div>
                            </li>

                        </ul>

                    </div>

                    {/* Column 4: Social Media */}
                    <div>

                        <h3 className="text-lg font-bold">
                            Follow Us
                        </h3>

                        <p className="mt-6 text-sm leading-7 text-white/65">
                            Stay connected with MentorLagbe and
                            discover the latest learning opportunities.
                        </p>

                        <div className="mt-6 flex items-center gap-3">

                            <a
                                href="https://www.facebook.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 transition-all hover:bg-emerald-400 hover:text-[#102A20]"
                            >
                                <FaFacebookF size={18} />
                            </a>

                            <a
                                href="https://www.instagram.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 transition-all hover:bg-emerald-400 hover:text-[#102A20]"
                            >
                                <FaInstagram size={19} />
                            </a>

                            <a
                                href="https://www.linkedin.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 transition-all hover:bg-emerald-400 hover:text-[#102A20]"
                            >
                                <FaLinkedinIn size={19} />
                            </a>

                            <a
                                href="https://x.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="X"
                                className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 transition-all hover:bg-emerald-400 hover:text-[#102A20]"
                            >
                                <FaXTwitter size={19} />
                            </a>

                        </div>

                    </div>

                </div>

                {/* Copyright */}
                <div className="mt-14 border-t border-white/10 pt-7">

                    <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">

                        <p className="text-sm text-white/50">
                            © <CurrentYear /> MentorLagbe.
                            All rights reserved.
                        </p>

                        <p className="text-sm text-white/50">
                            Made with care for a better learning community.
                        </p>

                    </div>

                </div>

            </div>

        </footer>
    );
}

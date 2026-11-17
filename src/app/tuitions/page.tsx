
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Monitor,
  CalendarDays,
  GraduationCap,
  ArrowRight,
  BookOpen,
  Users,
  X,
} from "lucide-react";

import { mockTuitions } from "@/constants/mock-tuitions";

export default function TuitionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] =
    useState("All Subjects");
  const [selectedMode, setSelectedMode] =
    useState("All Modes");
  const [selectedLocation, setSelectedLocation] =
    useState("All Locations");

  // Only show approved and active tuition posts.
  // Sort newest first and display a maximum of 6.
  const approvedTuitions = useMemo(() => {
    return [...mockTuitions]
      .filter(
        (tuition) =>
          tuition.approvalStatus === "approved" &&
          tuition.isActive === true
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 6);
  }, []);

  // Generate filter options from the tuition data.
  const subjects = [
    "All Subjects",
    ...Array.from(
      new Set(approvedTuitions.map((item) => item.subject))
    ),
  ];

  const locations = [
    "All Locations",
    ...Array.from(
      new Set(approvedTuitions.map((item) => item.location))
    ),
  ];

  // Search and filtering logic.
  const filteredTuitions = approvedTuitions.filter((tuition) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch = [
      tuition.title,
      tuition.subject,
      tuition.classLevel,
      tuition.location,
      tuition.tutorName,
      tuition.description,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search);

    const matchesSubject =
      selectedSubject === "All Subjects" ||
      tuition.subject === selectedSubject;

    const matchesMode =
      selectedMode === "All Modes" ||
      tuition.mode === selectedMode;

    const matchesLocation =
      selectedLocation === "All Locations" ||
      tuition.location === selectedLocation;

    return (
      matchesSearch &&
      matchesSubject &&
      matchesMode &&
      matchesLocation
    );
  });

  // Reset all filters.
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedSubject("All Subjects");
    setSelectedMode("All Modes");
    setSelectedLocation("All Locations");
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedSubject !== "All Subjects" ||
    selectedMode !== "All Modes" ||
    selectedLocation !== "All Locations";

  return (
    <main className="min-h-screen bg-[#FBF8F3] pb-20">

      {/* Page Header */}
      <section className="border-b border-[#E5E1D8] bg-white">
        <div className="site-container py-16 text-center">

          <span className="section-eyebrow">
            EXPLORE LEARNING OPPORTUNITIES
          </span>

          <h1 className="section-title mt-4">
            Find Your Perfect Tuition
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#5B6B64] md:text-lg">
            Discover verified tuition opportunities, connect
            with qualified tutors and find the right learning
            experience for your academic goals.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-6 text-sm text-[#5B6B64]">
            <span className="flex items-center gap-2">
              <GraduationCap size={19} className="text-[#0F5132]" />
              Qualified Tutors
            </span>

            <span className="flex items-center gap-2">
              <Monitor size={18} className="text-[#0F5132]" />
              Online & Offline
            </span>

            <span className="flex items-center gap-2">
              <BookOpen size={18} className="text-[#0F5132]" />
              Multiple Subjects
            </span>
          </div>

        </div>
      </section>

      {/* Search and Filters */}
      <section className="site-container -mt-1 pt-10">

        <div className="rounded-2xl border border-[#E5E1D8] bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal size={19} className="text-[#0F5132]" />

            <h2 className="font-semibold text-[#14201B]">
              Find Your Tuition
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

            {/* Search */}
            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-[#5B6B64]">
                Search
              </label>

              <Search
                size={19}
                className="absolute left-3 top-[43px] text-[#789087]"
              />

              <input
                type="text"
                placeholder="Search tuition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-xl border border-[#E5E1D8] bg-[#FBF8F3] pl-10 pr-4 text-sm outline-none transition focus:border-[#0F5132] focus:ring-2 focus:ring-[#0F5132]/10"
              />
            </div>

            {/* Subject Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5B6B64]">
                Select Subject
              </label>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="h-12 w-full rounded-xl border border-[#E5E1D8] bg-[#FBF8F3] px-4 text-sm outline-none focus:border-[#0F5132]"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5B6B64]">
                Learning Mode
              </label>

              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="h-12 w-full rounded-xl border border-[#E5E1D8] bg-[#FBF8F3] px-4 text-sm outline-none focus:border-[#0F5132]"
              >
                <option value="All Modes">All Modes</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5B6B64]">
                Location
              </label>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="h-12 w-full rounded-xl border border-[#E5E1D8] bg-[#FBF8F3] px-4 text-sm outline-none focus:border-[#0F5132]"
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 text-sm font-semibold text-[#0F5132] hover:underline"
              >
                <X size={15} />
                Clear Filters
              </button>
            </div>
          )}

        </div>
      </section>

      {/* Tuition Listings */}
      <section className="site-container pt-12">

        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">

          <div>
            <span className="section-eyebrow">
              AVAILABLE OPPORTUNITIES
            </span>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#14201B] md:text-3xl">
              Browse Tuition Listings
            </h2>

            <p className="mt-2 text-sm text-[#5B6B64]">
              Find the right learning opportunity for you.
            </p>
          </div>

          <div className="rounded-full bg-[#EAF1EC] px-4 py-2 text-sm font-semibold text-[#0F5132]">
            {filteredTuitions.length} Opportunities Found
          </div>

        </div>

        {/* Tuition Cards */}
        {filteredTuitions.length > 0 ? (

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

            {filteredTuitions.map((tuition) => (

              <article
                key={tuition._id}
                className="group overflow-hidden rounded-2xl border border-[#E5E1D8] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >

                {/* Card Banner */}
                <div
                  className="relative flex h-48 items-end bg-cover bg-center p-5"
                  style={{
                    backgroundImage: tuition.bannerImage
                      ? `linear-gradient(to top, rgba(10,35,25,0.75), rgba(10,35,25,0.05)), url("${tuition.bannerImage}")`
                      : "linear-gradient(135deg, #0F5132, #789B72)",
                  }}
                >

                  <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#0F5132] shadow-sm">

                    {tuition.mode === "Online" ? (
                      <Monitor size={14} />
                    ) : (
                      <MapPin size={14} />
                    )}

                    {tuition.mode}

                  </span>

                  <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#0F5132]">
                    {tuition.subject}
                  </span>

                </div>

                {/* Card Content */}
                <div className="p-5">

                  <h3 className="min-h-14 text-xl font-bold leading-7 text-[#14201B] transition group-hover:text-[#0F5132]">
                    {tuition.title}
                  </h3>

                  <div className="mt-4 space-y-3 text-sm text-[#5B6B64]">

                    <div className="flex items-center gap-2">
                      <GraduationCap size={18} className="shrink-0" />
                      <span>{tuition.classLevel}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDays size={17} className="shrink-0" />
                      <span>{tuition.daysPerWeek} Days / Week</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={17} className="shrink-0" />
                      <span>{tuition.location}</span>
                    </div>

                  </div>

                  {/* Monthly Fee */}
                  <div className="mt-5 rounded-xl bg-[#EAF1EC] p-4">

                    <p className="text-xs font-medium text-[#5B6B64]">
                      Monthly Tuition Fee
                    </p>

                    <p className="mt-1 text-2xl font-bold text-[#0F5132]">
                      ৳{tuition.monthlyFee.toLocaleString("en-BD")}

                      <span className="ml-1 text-sm font-normal text-[#5B6B64]">
                        / month
                      </span>
                    </p>

                  </div>

                  {/* Tutor Information */}
                  <div className="mt-5 flex items-center justify-between border-t border-[#E5E1D8] pt-4">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF1EC] text-sm font-bold text-[#0F5132]">
                        {tuition.tutorName
                          .split(" ")
                          .map((word) => word[0])
                          .slice(0, 2)
                          .join("")}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-[#789087]">
                          Tuition Instructor
                        </p>

                        <p className="truncate text-sm font-bold text-[#14201B]">
                          {tuition.tutorName}
                        </p>
                      </div>

                    </div>

                    <Users
                      size={20}
                      className="shrink-0 text-[#5B6B64]"
                    />

                  </div>

                  {/* Details Button */}
                  <Link
                    href={`/tuitions/${tuition._id}`}
                    className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#C9D9CF] bg-[#F1F6F2] font-semibold text-[#0F5132] transition hover:bg-[#0F5132] hover:text-white"
                  >
                    View Details
                    <ArrowRight size={18} />
                  </Link>

                </div>

              </article>

            ))}

          </div>

        ) : (

          /* Empty State */
          <div className="rounded-2xl border border-dashed border-[#C9D9CF] bg-white px-6 py-20 text-center">

            <Search
              size={42}
              className="mx-auto text-[#789087]"
            />

            <h3 className="mt-5 text-xl font-bold text-[#14201B]">
              No Tuition Found
            </h3>

            <p className="mt-2 text-sm text-[#5B6B64]">
              Try changing your search or filters to find
              available tuition opportunities.
            </p>

            <button
              onClick={resetFilters}
              className="mt-6 rounded-xl bg-[#0F5132] px-6 py-3 font-semibold text-white transition hover:bg-[#0B3F27]"
            >
              Reset Filters
            </button>

          </div>

        )}

      </section>

    </main>
  );
}

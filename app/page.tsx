"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import FeaturedProducts from "@/components/products/FeaturedProduct";

export default function HomePage() {
  const heroVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.7,
      },
    }),
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const categories = [
    {
      title: "Clothes",
      copy: "Baby, toddler, and kids outfits sorted by age and condition.",
      href: "/shop",
      accent: "from-sky-100 to-white",
    },
    {
      title: "Toys",
      copy: "Educational, fun, and safe playthings for every stage.",
      href: "/shop",
      accent: "from-rose-100 to-white",
    },
    {
      title: "Baby Essentials",
      copy: "Newborn basics, feeding items, and everyday care essentials.",
      href: "/shop",
      accent: "from-amber-100 to-white",
    },
    {
      title: "Shoes",
      copy: "Small-step shoes for toddlers and older kids, grouped by age.",
      href: "/shop",
      accent: "from-emerald-100 to-white",
    },
  ];

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#f7f9ff] px-4 py-16 md:px-8 md:py-14">
        <div className="absolute inset-0 z-0">
          <div className="absolute -left-32 top-12 h-64 w-64 rounded-full bg-sky-200/60 blur-3xl" />
          <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-amber-200/60 blur-3xl" />
        </div>

        <motion.div
          className="relative z-10 mx-auto flex max-w-7xl items-center gap-12 justify-center "
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-7xl">
            <motion.div
              className="mb-5 flex w-fit rounded-full border border-sky-200 bg-white mx-auto justify-center px-4 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 shadow-sm"
              custom={0}
              variants={heroVariants}
            >
              Children’s thrift marketplace
            </motion.div>

            <motion.h1
              className="max-w-4xl text-4xl text-center font-semibold leading-tight text-gray-900 sm:text-5xl md:text-7xl"
              custom={1}
              variants={heroVariants}
            >
              Find clothes, toys, and baby items fast.
            </motion.h1>

            <motion.p
              className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 mx-auto text-center"
              custom={2}
              variants={heroVariants}
            >
              A children-focused thrift shop for parents and caregivers. Search by age,
              condition, and category to find trusted items in seconds.
            </motion.p>

            <motion.div
              custom={3}
              variants={heroVariants}
              className="mt-8 flex flex-col gap-4 sm:flex-row mx-auto justify-center"
            >
              <Link href="/shop">
                <button className="w-full rounded-full bg-gray-900 px-8 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 sm:w-auto">
                  Browse shop
                </button>
              </Link>

              <Link href="/shop">
                <button className="w-full rounded-full border border-gray-300 bg-white px-8 py-4 text-sm font-semibold text-gray-900 transition hover:border-gray-900 sm:w-auto">
                  Shop by age
                </button>
              </Link>
            </motion.div>

            <motion.div
              custom={4}
              variants={heroVariants}
              className="mt-10 flex flex-wrap gap-3 mx-auto justify-center"
            >
              {[
                "0–6 months",
                "Like New",
                "Baby Essentials",
                "Unisex items",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="relative"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            {/* <div className="rounded-[2rem] border border-white/80 bg-white p-5 shadow-2xl">
              <div className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-300">
                  Shop smarter
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight">
                  Built for clarity, trust, and quick decisions.
                </h2>
                <p className="mt-4 text-sm leading-7 text-gray-300">
                  Parents can narrow down items by age, condition, and category without
                  digging through clutter.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    "Age-first browsing",
                    "Verified clean items",
                    "Baby-friendly filters",
                    "Fast checkout flow",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div> */}
          </motion.div>
        </motion.div>
      </section>

      {/* Category Browse */}
      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-10 rounded-4xl bg-slate-50 px-6 py-8 shadow-sm ring-1 ring-slate-200/70 flex flex-col gap-3 md:px-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
              Most popular categories
            </p>
            <h2 className="text-3xl font-semibold text-gray-900 md:text-4xl">
              Start with the category families look for most.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              Jump straight to the things parents ask for first: clothes, toys, baby essentials, and shoes.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                className={`rounded-[1.75rem] bg-linear-to-br ${category.accent} border border-gray-200 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: index * 0.08, duration: 0.55 },
                  },
                }}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-lg font-semibold text-gray-900 shadow-sm">
                  {category.title.charAt(0)}
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-600">
                  {category.title}
                </p>
                <p className="mt-4 text-base leading-7 text-gray-700">
                  {category.copy}
                </p>
                <Link
                  href={category.href}
                  className="mt-6 inline-flex text-sm font-semibold text-gray-900 underline decoration-gray-400 underline-offset-4"
                >
                  Browse {category.title.toLowerCase()}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Featured Products */}
      <section className="py-14 border-t border-slate-100 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between ">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-gray-400">
                Featured picks
              </p>
              <h2 className="text-4xl font-bold text-white mb-4">New Arrivals</h2>
              <p className="text-lg text-gray-300">
                Hand-picked treasures for your growing family.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex text-sm font-semibold text-white underline decoration-gray-500 underline-offset-4"
            >
              View all products
            </Link>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      {/* Best Sellers */}
      <FeaturedProducts
        eyebrow="Best sellers"
        title="Most Loved Finds"
        description="Popular picks that move quickly for growing kids and busy parents."
        sectionClassName="py-24 border-t border-slate-100 bg-white"
        titleClassName="text-gray-900"
        descriptionClassName="text-gray-600"
        showRankingBadges
        loadingLabel="Loading best sellers..."
        emptyLabel="No best sellers available yet."
        productLimit={4}
      />

      {/* Call to Action */}
      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-4xl bg-linear-to-r from-slate-900 via-gray-900 to-slate-800 px-6 py-12 text-white md:px-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-gray-400">
                  Ready to shop?
                </p>
                <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
                  Start with the right category and find items faster.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-300">
                  Browse children’s clothes, toys, baby essentials, and shoes with trust-focused filters and clean product labels.
                </p>
              </div>

              <Link href="/shop">
                <button className="w-full rounded-full bg-white px-8 py-4 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 lg:w-auto">
                  Open Shop
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

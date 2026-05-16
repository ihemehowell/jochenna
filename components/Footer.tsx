"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Shop",
      links: [
        { label: "New Arrivals", href: "/shop?category=new" },
        { label: "Clothes", href: "/shop?category=clothes" },
        { label: "Toys", href: "/shop?category=toys" },
        { label: "Baby Items", href: "/shop?category=baby" },
        { label: "Shoes", href: "/shop?category=shoes" },
      ],
    },
    {
      title: "Account",
      links: [
        // { label: "Sign In", href: "/auth" },
        { label: "My Orders", href: "/orders" },
        { label: "Wishlist", href: "/wishlist" },
        { label: "Account Settings", href: "/auth" },
      ],
    },
    {
      title: "Company",
      links: [
        // { label: "About Us", href: "#" },
        // { label: "Blog", href: "#" },
        { label: "Contact", href: "#contact" },
        { label: "Sustainability", href: "#" },
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="bg-gray-900 text-gray-100">
      {/* Newsletter Section */}
      <motion.section
        className="border-b border-gray-800 bg-linear-to-r from-gray-900 to-gray-800 px-4 py-12 md:px-8 md:py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-center">
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <h3 className="text-2xl font-bold md:text-3xl">
                Stay Updated
              </h3>
              <p className="mt-2 text-gray-400">
                Get new arrivals and exclusive deals delivered to your inbox.
              </p>
            </motion.div>
            <motion.form
              variants={itemVariants}
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-full border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-gray-600 focus:bg-gray-700"
              />
              <button className="rounded-full bg-white px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-100 whitespace-nowrap">
                Subscribe
              </button>
            </motion.form>
          </div>
        </div>
      </motion.section>

      {/* Main Footer Content */}
      <motion.section
        className="px-4 py-12 md:px-8 md:py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand Column */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <Link href="/" className="text-2xl font-bold">
                Jochenna
              </Link>
              <p className="mt-4 text-sm text-gray-400">
                Sustainable children&apos;s thrift marketplace for parents and caregivers.
              </p>
              <div className="mt-6 flex gap-3">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition hover:bg-gray-700"
                  aria-label="Twitter"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20a11.08 11.08 0 0011.08-11.08 7.7 7.7 0 00.3-1.5A7.86 7.86 0 0020 5.5a7.86 7.86 0 01-2.26.62 3.94 3.94 0 001.73-2.17 7.88 7.88 0 01-2.5.95 3.94 3.94 0 00-7.14 2.69c0 .31.03.61.1.9A11.1 11.1 0 012.8 6.12a3.94 3.94 0 001.22 5.26 3.9 3.9 0 01-1.79-.5v.05a3.94 3.94 0 003.16 3.86 3.93 3.93 0 01-1.78.07 3.94 3.94 0 003.68 2.73A7.88 7.88 0 018.29 20" />
                  </svg>
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition hover:bg-gray-700"
                  aria-label="Instagram"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.646.069 4.85 0 3.204-.012 3.584-.07 4.85-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.646-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 110-2.881 1.44 1.44 0 010 2.881z" />
                  </svg>
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition hover:bg-gray-700"
                  aria-label="Facebook"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </motion.a>
              </div>
            </motion.div>

            {/* Footer Links */}
            {footerSections.map((section, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="sm:col-span-1"
              >
                <h4 className="font-semibold text-white">{section.title}</h4>
                <ul className="mt-4 space-y-3">
                  {section.links.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Contact Info */}
            <motion.div
              variants={itemVariants}
              className="sm:col-span-2 lg:col-span-1"
            >
              <h4 className="font-semibold text-white">Contact</h4>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="mailto:support@jochenna.com"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
                  >
                    <Mail size={16} />
                    support@jochenna.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+234800000000"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
                  >
                    <Phone size={16} />
                    +234 800 000 0000
                  </a>
                </li>
                <li className="inline-flex items-start gap-2 text-sm text-gray-400">
                  <MapPin size={16} className="shrink-0 mt-0.5" />
                  <span>Lagos, Nigeria</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Footer Bottom */}
          <motion.div
            variants={itemVariants}
            className="mt-12 border-t border-gray-800 pt-8"
          >
            <div className="grid gap-4 sm:grid-cols-2 md:flex md:items-center md:justify-between">
              <p className="text-sm text-gray-400">
                © {currentYear} Jochenna. All rights reserved.
              </p>
              <div className="flex flex-wrap gap-6">
                <Link
                  href="#"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Terms of Service
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Cookies
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Heart Animation */}
      <div className="flex justify-center pb-6 pt-2">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-red-500"
        >
          <Heart size={20} fill="currentColor" />
        </motion.div>
      </div>
    </footer>
  );
}

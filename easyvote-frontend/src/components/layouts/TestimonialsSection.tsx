// components/home/TestimonialsSection.tsx
import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { useTranslation } from "@/i18n"

export default function TestimonialsSection() {
  const { t } = useTranslation()

  const testimonials = [
    {
      name: "Marie Chen",
      role: t("testimonials.role1"),
      content: t("testimonials.content1"),
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/4.jpg"
    },
    {
      name: "Lucas Martin",
      role: t("testimonials.role2"),
      content: t("testimonials.content2"),
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/5.jpg"
    },
    {
      name: "Sophie Bernard",
      role: t("testimonials.role3"),
      content: t("testimonials.content3"),
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/6.jpg"
    }
  ]

  return (
    <section className="py-24 px-4 bg-indigo-50 dark:bg-indigo-950/20">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t("testimonials.title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t("testimonials.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-indigo-200 dark:text-indigo-800" />
              
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 italic">
                "{testimonial.content}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
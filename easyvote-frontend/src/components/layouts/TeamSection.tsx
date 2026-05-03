// components/home/TeamSection.tsx
import { motion } from "framer-motion"
import { Mail, Award, Code, Lightbulb, Shield } from "lucide-react"
import { useTranslation } from "@/i18n"

export default function TeamSection() {
    const { t } = useTranslation()

    const team = [
        {
            name: "Ahmed Ltayef",
            role: t("team.roles.lead_developer"),
            department: t("team.departments.computer_science"),
            bio: t("team.bio1"),
            social: {
                github: "https://github.com/ahmed",
                linkedin: "https://linkedin.com/in/ahmed",
                twitter: "https://twitter.com/ahmed"
            },
            skills: ["React", "Spring Boot", "UI/UX"],
            color: "from-indigo-500 to-blue-500"
        },
        {
            name: "Issra Akrout",
            role: t("team.roles.lead_developer"),
            department: t("team.departments.computer_science"),
            bio: t("team.bio1"),
            social: {
                github: "https://github.com/issra",
                linkedin: "https://linkedin.com/in/issra",
                twitter: "https://twitter.com/issra"
            },
            skills: ["React", "Spring Boot", "UI/UX"],
            color: "from-purple-500 to-pink-500"
        },
        {
            name: "Talel Mejri",
            role: t("team.roles.lead_developer"),
            department: t("team.departments.computer_science"),
            bio: t("team.bio1"),
            social: {
                linkedin: "https://linkedin.com/in/talel",
            },
            skills: ["React", "Spring Boot", "UI/UX"],
            color: "from-pink-500 to-rose-500"
        }
    ]

    return (
        <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="container mx-auto max-w-7xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 backdrop-blur-sm border border-indigo-200/30 dark:border-indigo-800/30 mb-6">
                        <Code className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("team.badge")}
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
                        <span className="text-gray-900 dark:text-white">
                            {t("team.title")}
                        </span>{" "}
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                            {t("team.title_highlight")}
                        </span>
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                        {t("team.subtitle")}
                    </p>
                </motion.div>

                {/* Team Grid - 3 columns for 3 members */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {team.map((member, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            whileHover={{ y: -8 }}
                            className="group"
                        >
                            <div className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                                {/* Gradient Header without Image */}
                                <div className={`relative h-32 bg-gradient-to-r ${member.color}`}>
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                                        <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900`}>
                                            <span className="text-3xl font-bold text-white">
                                                {member.name.charAt(0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 pt-14">
                                    <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white text-center">
                                        {member.name}
                                    </h3>
                                    <p className={`text-sm font-semibold bg-gradient-to-r ${member.color} bg-clip-text text-transparent mb-2 text-center`}>
                                        {member.role}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
                                        {member.department}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center line-clamp-2">
                                        {member.bio}
                                    </p>

                                    {/* Skills Tags */}
                                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                                        {member.skills.map((skill, i) => (
                                            <span key={i} className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex justify-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">

                                        <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer"
                                            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:scale-110">
                                            <i className="fa fa-linkedin" aria-hidden="true"></i>
                                        </a>

                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Team Values */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                        {[
                            { icon: Lightbulb, label: t("team.values.innovation"), color: "from-amber-500 to-orange-500" },
                            { icon: Shield, label: t("team.values.security"), color: "from-emerald-500 to-teal-500" },
                            { icon: Award, label: t("team.values.excellence"), color: "from-indigo-500 to-blue-500" },
                            { icon: Code, label: t("team.values.opensource"), color: "from-purple-500 to-pink-500" }
                        ].map((value, idx) => (
                            <div key={idx} className="text-center group">
                                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                    <value.icon className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {value.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
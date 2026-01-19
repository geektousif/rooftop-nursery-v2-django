"use client"

import { Truck, Shield, Leaf, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

const features = [
  {
    icon: Leaf,
    title: "Premium Quality",
    description: "Hand-selected bulbs and seeds from trusted growers worldwide",
  },
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Free shipping on orders over $50 with careful packaging",
  },
  {
    icon: Shield,
    title: "Growth Guarantee",
    description: "100% satisfaction guarantee on all our products",
  },
  {
    icon: Users,
    title: "Expert Support",
    description: "Get gardening advice from our team of horticulture experts",
  },
]

export function WhyUsSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Why Choose Rooftop Nursery?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're passionate about helping you create the garden of your dreams with quality products and expert
            guidance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center hover:shadow-md transition-shadow border-border/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground text-balance">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

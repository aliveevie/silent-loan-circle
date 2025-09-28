import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Shield, Users, Zap, Lock, ArrowRight, Circle } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Landing() {
  const features = [
    {
      icon: Shield,
      title: "Privacy First",
      description: "Zero-knowledge proofs ensure your financial activities remain completely private on the Midnight blockchain.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join trusted circles of friends, family, or colleagues to save and borrow together safely.",
    },
    {
      icon: Zap,
      title: "Instant Payouts",
      description: "Automated smart contracts ensure fair and timely distributions to circle members.",
    },
    {
      icon: Lock,
      title: "Secure & Trustless",
      description: "Built on Midnight blockchain with cryptographic guarantees, no central authority needed.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-pulse"></div>
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="text-center space-y-8 animate-fade-up">
            <div className="flex justify-center mb-8">
              <img src={logo} alt="Silent Loan Circle" className="h-20 w-20" />
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
              Silent Loan Circle
            </h1>
            
            <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
              Private community savings on Midnight
            </p>
            
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              Join privacy-preserving rotating savings circles. Contribute privately, 
              access funds when you need them, all powered by zero-knowledge proofs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link to="/create">
                  Create Circle
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 border-white/20 text-white hover:bg-white/10">
                <Link to="/dashboard">
                  View Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 animate-pulse">
          <Circle className="h-4 w-4 text-white/20" />
        </div>
        <div className="absolute top-40 right-20 animate-pulse" style={{animationDelay: "1s"}}>
          <Circle className="h-6 w-6 text-white/20" />
        </div>
        <div className="absolute bottom-20 left-20 animate-pulse" style={{animationDelay: "2s"}}>
          <Circle className="h-3 w-3 text-white/20" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Silent Loan Circle?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of community savings with privacy, security, and transparency
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-scale-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, transparent, and private
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold">Create or Join Circle</h3>
              <p className="text-muted-foreground">
                Start a new savings circle with trusted members or join an existing one
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold">Contribute Privately</h3>
              <p className="text-muted-foreground">
                Make your contributions using zero-knowledge proofs to maintain privacy
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold">Receive Payouts</h3>
              <p className="text-muted-foreground">
                Get your turn to receive the pooled funds according to the rotation schedule
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Start Saving Privately?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users already building wealth through trusted community circles
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8">
            <Link to="/create">
              Create Your First Circle
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
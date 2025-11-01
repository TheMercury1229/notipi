import { Navbar } from "@/components/dashboard/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "5,000 emails/month",
      "5 templates",
      "2 API keys",
      "Email support",
      "Basic analytics",
    ],
    limitations: [
      "No SMS notifications",
      "No priority support",
      "Limited webhooks",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    description: "For growing businesses",
    features: [
      "100,000 emails/month",
      "Unlimited templates",
      "10 API keys",
      "SMS notifications (1,000/mo)",
      "Priority email support",
      "Advanced analytics",
      "Custom webhooks",
      "Team collaboration",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale operations",
    features: [
      "Unlimited emails",
      "Unlimited templates",
      "Unlimited API keys",
      "Unlimited SMS",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "White-label options",
      "Advanced security",
      "Dedicated infrastructure",
    ],
    highlighted: false,
  },
];

export default function PricingPage() {
  const { currentPlan, updatePlan } = useUserStore();

  const handleUpgrade = (planName: string) => {
    const plan = planName.toLowerCase() as "free" | "pro" | "enterprise";
    updatePlan(plan);
    toast.success("Plan updated successfully!");
  };

  return (
    <div className="flex-1 overflow-auto">
      <Navbar title="Pricing" />

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Choose Your Plan</h2>
            <p className="text-muted-foreground text-lg">
              Scale your notifications as your business grows
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const isPlanLowerCase = plan.name.toLowerCase();
              const isCurrentPlan = currentPlan === isPlanLowerCase;

              return (
                <Card
                  key={plan.name}
                  className={`relative ${
                    plan.highlighted ? "border-primary shadow-lg scale-105" : ""
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="px-4 py-1">Most Popular</Badge>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <Badge variant="secondary">Current Plan</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8 pt-6">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.price !== "Custom" && (
                        <span className="text-muted-foreground">/month</span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.limitations && (
                      <div className="border-t pt-4">
                        <p className="text-xs text-muted-foreground mb-2">
                          Not included:
                        </p>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, i) => (
                            <li
                              key={i}
                              className="text-xs text-muted-foreground"
                            >
                              • {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                      disabled={isCurrentPlan}
                      onClick={() => handleUpgrade(plan.name)}
                    >
                      {isCurrentPlan
                        ? "Current Plan"
                        : plan.name === "Enterprise"
                        ? "Contact Sales"
                        : "Upgrade to " + plan.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* FAQ Section */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">
                  Can I change my plan at any time?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time.
                  Changes will be reflected in your next billing cycle.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">
                  What happens if I exceed my plan limits?
                </h4>
                <p className="text-sm text-muted-foreground">
                  We'll notify you when you're approaching your limits. You can
                  upgrade your plan or purchase additional credits as needed.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, we offer a 30-day money-back guarantee on all paid plans
                  if you're not satisfied with our service.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">
                  How does Clerk webhook integration work?
                </h4>
                <p className="text-sm text-muted-foreground">
                  When you upgrade through Clerk, webhooks automatically sync
                  your plan status with our backend. This ensures seamless plan
                  management and billing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

"use client";

import { getLocaleCurrency } from "@/utils/misc";
import { Polar } from "@polar-sh/sdk";
import { api } from "@v1/backend/convex/_generated/api";
import { CURRENCIES, PLANS } from "@v1/backend/convex/schema";
import { Switch } from "@v1/ui/switch";
import { useAction, useQuery } from "convex/react";
import { useState, useEffect } from "react";
import { Card, Box, Container, Flex, Text, Heading, Grid, Button } from '@radix-ui/themes';
import { StarFilledIcon, InfoCircledIcon, ExternalLinkIcon } from '@radix-ui/react-icons';

export default function BillingSettings() {
  const user = useQuery(api.users.getUser);
  const getUpgradeCheckoutUrl = useAction(
    api.subscriptions.getProOnboardingCheckoutUrl,
  );
  const plans = useQuery(api.subscriptions.listPlans);

  const [selectedPlanInterval, setSelectedPlanInterval] = useState<
    "month" | "year"
  >("month");

  const [currency, setCurrency] = useState(CURRENCIES.USD);

  useEffect(() => {
    setCurrency(getLocaleCurrency());
  }, []);

  const freePlan = plans?.find((plan) => plan.key === PLANS.FREE);
  const proPlan = plans?.find((plan) => plan.key === PLANS.PRO);

  const handleUpgradeCheckout = async () => {
    const url = await getUpgradeCheckoutUrl({ interval: selectedPlanInterval });
    if (!url) {
      return;
    }
    window.location.href = url;
  };

  const handleDowngrade = () => {
    window.location.href = `https://sandbox.polar.sh/purchases/subscriptions/${user.subscription?.polarId}`;
  };

  if (!user || !plans) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card size="3" style={{ background: 'white' }}>
        <Box p="6">
          <Heading as="h2" size="5" mb="4" weight="medium">
            Secure Payments
          </Heading>
          <Text as="p" size="2" color="gray" mb="4">
            TEKIMAX partners with Stripe to provide secure and reliable payment processing. 
          </Text>
        </Box>
      </Card>

      <Card size="3" style={{ background: 'white' }}>
        <Box p="6">
          <Heading as="h2" size="5" mb="4" weight="medium">Plan Information</Heading>
          <Text as="p" size="2" color="gray" mb="6">
            Choose the plan that best fits your needs. All plans include our core features, with additional capabilities in the Pro tier.
          </Text>

          <Text as="p" size="2" color="gray" mb="6">
            You are currently on the{" "}
            <Box as="span" className="inline-flex items-center rounded-md bg-[var(--accent-9)] px-2 py-0.5">
              <Text size="2" weight="medium" style={{ color: 'white' }}>
                {user.subscription?.planId === proPlan?._id ? "Pro" : "Free"}
              </Text>
            </Box>
            {" "}plan.
          </Text>

          <Grid columns="1" gap="4">
            {plans.map((plan) => (
              <Card
                key={plan._id}
                variant="surface"
                className={`${user.subscription?.planId === plan._id ? "border-2 border-[var(--accent-9)]" : ""} transition-all hover:border-[var(--accent-8)]`}
              >
                <Box p="4">
                  <Flex justify="between" align="center">
                    <Box>
                      <Flex gap="2" align="center" mb="1">
                        <Text as="p" size="2" weight="medium">
                          {plan.name}
                          {user.subscription?.planId === plan._id && (
                            <Box as="span" className="ml-2 inline-flex items-center rounded-md bg-[var(--accent-3)] px-2 py-0.5">
                              <Text size="1" weight="medium">Active</Text>
                            </Box>
                          )}
                        </Text>
                        {plan._id !== freePlan?._id && (
                          <Box className="rounded-md bg-[var(--accent-3)] px-2 py-0.5">
                            <Text size="2" weight="medium">
                              {currency === CURRENCIES.USD ? "$" : "€"}{" "}
                              {selectedPlanInterval === "month"
                                ? (plan.prices.month?.[currency]?.amount ?? 0) / 100
                                : (plan.prices.year?.[currency]?.amount ?? 0) / 100}{" "}
                              / {selectedPlanInterval === "month" ? "month" : "year"}
                            </Text>
                          </Box>
                        )}
                      </Flex>
                      <Text as="p" size="2" color="gray">
                        {plan._id === freePlan?._id 
                          ? "Get started with essential features and basic usage limits"
                          : "Unlock advanced features, higher usage limits, and priority support"}
                      </Text>
                    </Box>

                    {plan._id !== freePlan?._id && (
                      <Flex align="center" gap="2">
                        <Text as="label" size="2" color="gray">
                          {selectedPlanInterval === "month" ? "Monthly" : "Yearly"}
                        </Text>
                        <Switch
                          checked={selectedPlanInterval === "year"}
                          onCheckedChange={() =>
                            setSelectedPlanInterval((prev) =>
                              prev === "month" ? "year" : "month",
                            )
                          }
                        />
                      </Flex>
                    )}
                  </Flex>
                </Box>
              </Card>
            ))}
          </Grid>

          {user.subscription?.planId === freePlan?._id && (
            <Box mt="4">
              <Button 
                size="3" 
                variant="solid" 
                highContrast
                onClick={handleUpgradeCheckout}
              >
                <StarFilledIcon className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            </Box>
          )}

          {user.subscription?.planId === proPlan?._id && (
            <Box mt="4">
              <Button 
                size="3" 
                variant="soft"
                color="red"
                onClick={handleDowngrade}
              >
                Downgrade to Free
              </Button>
              <Text as="p" size="2" color="gray" mt="2">
                Your Pro features will remain active until the end of your current billing period.
              </Text>
            </Box>
          )}
        </Box>
      </Card>

      <Card size="3" style={{ background: 'white' }}>
        <Box p="6">
          <Heading as="h2" size="5" mb="4" weight="medium">
            Manage Subscription
          </Heading>
          <Text as="p" size="2" color="gray" mb="6">
            Update your payment method, billing address, and more.
          </Text>

          <Card variant="surface" style={{ background: 'var(--gray-2)' }} className="p-4">
            <Flex justify="between" align="center">
              <Box>
                <Text as="p" size="2" weight="medium" mb="1">
                  Billing Portal
                </Text>
                <Text as="p" size="2" color="gray">
                  Manage your subscription, payment methods, and billing history.
                </Text>
              </Box>

              <a
                href={`https://sandbox.polar.sh/purchases/subscriptions/${user.subscription?.polarId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex"
              >
                <Button size="3" variant="solid" highContrast>
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              </a>
            </Flex>
          </Card>
        </Box>
      </Card>
    </div>
  );
}

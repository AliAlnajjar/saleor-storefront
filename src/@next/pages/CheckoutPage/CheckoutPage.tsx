import React from "react";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";

import { Button } from "@components/atoms";
import { CheckoutProgressBar } from "@components/molecules";
import { CartSummary, CheckoutAddress } from "@components/organisms";
import { Checkout } from "@components/templates";
import { useCart, useCheckout, useUserDetails } from "@sdk/react";

import { IProps } from "./types";

const steps = [
  {
    link: "/new-checkout/address",
    name: "Address",
    nextActionName: "Continue to Shipping",
    nextStepLink: "/new-checkout/shipping",
  },
  {
    link: "/new-checkout/shipping",
    name: "Shipping",
    nextActionName: "Continue to Payment",
    nextStepLink: "/new-checkout/payment",
  },
  {
    link: "/new-checkout/payment",
    name: "Payment",
    nextActionName: "Continue to Review",
    nextStepLink: "/new-checkout/review",
  },
  {
    link: "/new-checkout/review",
    name: "Review",
    nextActionName: "Finalize order",
    nextStepLink: "/new-order-finalized",
  },
];

const CheckoutPage: React.FC<IProps> = ({}: IProps) => {
  const { pathname } = useLocation();
  const history = useHistory();
  const { data: user } = useUserDetails();
  const { shippingPrice, subtotalPrice, totalPrice, items } = useCart();
  const { checkout, setShippingAddress } = useCheckout();

  const activeStepIndex = steps.findIndex(({ link }) => link === pathname);
  const activeStep = steps[activeStepIndex];
  const products = items?.map(({ variant, totalPrice, quantity }) => ({
    name: variant.name || "",
    price: {
      gross: {
        amount: totalPrice?.gross.amount || 0,
        currency: totalPrice?.gross.currency || "",
      },
      net: {
        amount: totalPrice?.net.amount || 0,
        currency: totalPrice?.net.currency || "",
      },
    },
    quantity,
    sku: variant.sku || "",
    thumbnail: {
      alt: variant.product?.thumbnail?.alt || undefined,
      url: variant.product?.thumbnail?.url,
      url2x: variant.product?.thumbnail2x?.url,
    },
  }));

  const checkoutProgress = (
    <CheckoutProgressBar steps={steps} activeStep={activeStepIndex} />
  );
  const cartSummary = (
    <CartSummary
      shipping={shippingPrice || undefined}
      subtotal={subtotalPrice || undefined}
      total={totalPrice || undefined}
      products={products}
    />
  );
  const checkoutView = (
    <Switch>
      <Route
        path={steps[0].link}
        render={props => (
          <CheckoutAddress
            {...props}
            checkoutAddress={{
              ...checkout?.shippingAddress,
              phone: checkout?.shippingAddress?.phone || undefined,
            }}
            userAddresses={user?.addresses}
            setShippingAddress={(id, address) =>
              setShippingAddress({
                ...address,
                id,
              })
            }
          />
        )}
      />
    </Switch>
  );
  const button = (
    <Button onClick={() => history.push(activeStep.nextStepLink)}>
      {activeStep.nextActionName.toUpperCase()}
    </Button>
  );

  return (
    <Checkout
      navigation={checkoutProgress}
      cartSummary={cartSummary}
      checkout={checkoutView}
      button={button}
    />
  );
};

export { CheckoutPage };
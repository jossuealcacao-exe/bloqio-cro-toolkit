import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    // If there is no valid session, Shopify's auth helpers often throw a Response
    // (redirect or unauthorized). We catch that and redirect to /auth/login.
    await authenticate.admin(request);
  } catch (err) {
    if (err instanceof Response) {
      const url = new URL(request.url);
      const shop = url.searchParams.get("shop");
      const next = shop
        ? `/auth/login?shop=${encodeURIComponent(shop)}`
        : "/auth/login";

      return new Response(null, {
        status: 302,
        headers: {
          Location: next,
          "Cache-Control": "no-store",
        },
      });
    }
    throw err;
  }

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">Home</s-link>
        <s-link href="/app/additional">Additional page</s-link>
      </s-app-nav>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

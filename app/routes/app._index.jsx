import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  InlineStack,
  BlockStack,
  List,
  Link,
  Toast,
  Frame,
  Banner,
  Divider,
  Box,
  TextField,
  Badge,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

import enTranslations from "@shopify/polaris/locales/en.json";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

function getStoreHandleFromUrl() {
  // Admin URLs look like: https://admin.shopify.com/store/<store-handle>/apps/<app>
  try {
    const path = window.location.pathname || "";
    const parts = path.split("/store/");
    if (parts.length < 2) return null;
    const rest = parts[1];
    const handle = rest.split("/")[0];
    return handle || null;
  } catch {
    return null;
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export default function Index() {
  const shopify = useAppBridge();
  const [storeHandle, setStoreHandle] = useState(null);
  const [toast, setToast] = useState({ active: false, content: "" });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handle = getStoreHandleFromUrl();
    if (handle) setStoreHandle(handle);
  }, []);

  const urls = useMemo(() => {
    const handle = storeHandle;
    const base = handle ? `https://admin.shopify.com/store/${handle}` : "https://admin.shopify.com";
    return {
      themeEditorHome: handle
        ? `${base}/themes/current/editor`
        : "https://admin.shopify.com/store/your-store-handle/themes/current/editor",
      themeEditorAppEmbeds: handle
        ? `${base}/themes/current/editor?context=apps`
        : "https://admin.shopify.com/store/your-store-handle/themes/current/editor?context=apps",
    };
  }, [storeHandle]);

  const presets = useMemo(
    () => ({
      messagesSimple: [
        { icon: "truck", text: "Envío rápido 24–72h" },
        { icon: "shield", text: "Garantía de satisfacción" },
        { icon: "lock", text: "Pago 100% seguro" },
        { icon: "tag", text: "Oferta limitada" },
      ],
      countdownPrefix: "Oferta termina en",
      countdownSuffix: "Finaliza pronto",
    }),
    [],
  );

  const showToast = useCallback((content) => setToast({ active: true, content }), []);
  const dismissToast = useCallback(() => setToast({ active: false, content: "" }), []);

  const onCopy = useCallback(
    async (text, label) => {
      const ok = await copyToClipboard(text);
      if (shopify?.toast?.show) {
        shopify.toast.show(ok ? `Copiado: ${label}` : `No se pudo copiar: ${label}`);
      } else {
        showToast(ok ? `Copiado: ${label}` : `No se pudo copiar: ${label}`);
      }
    },
    [shopify, showToast],
  );

  const open = useCallback((href) => {
    try {
      window.open(href, "_blank", "noopener,noreferrer");
    } catch {
      // no-op
    }
  }, []);

  return (
    <AppProvider i18n={enTranslations}>
      <Frame>
        {toast.active ? <Toast content={toast.content} onDismiss={dismissToast} /> : null}

        <Page
          title="Bloqio CRO Toolkit"
          subtitle="CRO blocks for Shopify: faster trust, faster sales."
          primaryAction={{
            content: "Abrir App embeds (TopBar)",
            onAction: () => open(urls.themeEditorAppEmbeds),
          }}
          secondaryActions={[
            { content: "Abrir Theme Editor", onAction: () => open(urls.themeEditorHome) },
          ]}
        >
          <Layout>
            <Layout.Section>
              <Card padding="400">
                <BlockStack gap="300">
                  <InlineStack gap="200" wrap align="center">
                    <Badge tone="success">Listo para vender</Badge>
                    <Badge tone="info">Suite CRO</Badge>
                    <Text as="span" tone="subdued">
                      Store: <strong>{storeHandle || "detectando…"}</strong>
                    </Text>
                  </InlineStack>

                  <Divider />

                  <Text variant="headingMd" as="h2">
                    1) Checklist rápido (para que quede ON)
                  </Text>
                  <List type="bullet">
                    <List.Item>
                      En <strong>App embeds</strong>, activa <strong>Bloqio TopBar PRO</strong>.
                    </List.Item>
                    <List.Item>
                      En el Theme Editor, agrega tus secciones: <strong>Badges</strong>, <strong>Trust Bar</strong>, <strong>FAQ</strong>, <strong>Featured Product</strong>.
                    </List.Item>
                    <List.Item>
                      Revisa <strong>mobile/desktop</strong>: que no tape el header y que no deje espacios raros.
                    </List.Item>
                    <List.Item>
                      Si no aparece: <strong>Save</strong> → refresca → vuelve a abrir el editor.
                    </List.Item>
                  </List>

                  <Banner status="info">
                    <p>
                      Tip rápido: si estás empezando, usa estos iconos: <strong>truck</strong>, <strong>shield</strong>, <strong>lock</strong>, <strong>tag</strong>.
                    </p>
                  </Banner>
                </BlockStack>
              </Card>

              <Box paddingBlockStart="400" />

              <Card padding="400">
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    2) Presets listos (copia/pega)
                  </Text>

                  <Card padding="300">
                    <BlockStack gap="200">
                      <Text variant="headingSm" as="h3">Mensajes (modo Simple)</Text>
                      <Text as="p" tone="subdued">
                        Llena “Mensaje 1/2/3…” con un icono y un texto. Aquí tienes una base pro.
                      </Text>

                      <BlockStack gap="200">
                        {presets.messagesSimple.map((m, idx) => (
                          <InlineStack key={idx} gap="200" align="center" wrap>
                            <Badge tone="new">{m.icon}</Badge>
                            <Text as="span">{m.text}</Text>
                          </InlineStack>
                        ))}
                      </BlockStack>

                      <InlineStack gap="200" wrap>
                        <Button
                          onClick={() =>
                            onCopy(
                              presets.messagesSimple.map((m) => `${m.icon}: ${m.text}`).join("\n"),
                              "Mensajes (Simple)",
                            )
                          }
                        >
                          Copiar lista
                        </Button>
                      </InlineStack>
                    </BlockStack>
                  </Card>

                  <Card padding="300">
                    <BlockStack gap="200">
                      <Text variant="headingSm" as="h3">Countdown recomendado</Text>
                      <Text as="p" tone="subdued">
                        Ajusta prefijo/sufijo para que suene humano y genere urgencia.
                      </Text>

                      <InlineStack gap="300" wrap>
                        <TextField
                          label="Prefijo"
                          value={presets.countdownPrefix}
                          readOnly
                          autoComplete="off"
                        />
                        <Button onClick={() => onCopy(presets.countdownPrefix, "Prefijo")}>Copiar</Button>

                        <TextField
                          label="Sufijo"
                          value={presets.countdownSuffix}
                          readOnly
                          autoComplete="off"
                        />
                        <Button onClick={() => onCopy(presets.countdownSuffix, "Sufijo")}>Copiar</Button>
                      </InlineStack>
                    </BlockStack>
                  </Card>
                </BlockStack>
              </Card>

              <Box paddingBlockStart="400" />

              <Card padding="400">
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h2">
                    3) FAQ y troubleshooting (comercial)
                  </Text>

                  <Text variant="headingSm" as="h3">FAQ</Text>
                  <List type="bullet">
                    <List.Item>
                      <strong>¿Necesito tocar código?</strong> No. Todo se configura en el editor.
                    </List.Item>
                    <List.Item>
                      <strong>¿Por qué no aparece la sección?</strong> Estás en otro theme o falta guardar.
                    </List.Item>
                    <List.Item>
                      <strong>¿La TopBar tapa el menú?</strong> Apaga “Sticky” o ajusta el offset/altura (en el embed).
                    </List.Item>
                    <List.Item>
                      <strong>¿Puedo usar solo contador o solo mensajes?</strong> Sí: desactiva lo que no uses.
                    </List.Item>
                    <List.Item>
                      <strong>¿Qué permisos usa?</strong> Solo los necesarios para operar. Si algo no aplica a tu tienda, no lo activas.
                    </List.Item>
                    <List.Item>
                      <strong>¿Esto afecta mi theme actual?</strong> No, se instala como app embed/secciones y puedes apagarlo cuando quieras.
                    </List.Item>
                    <List.Item>
                      <strong>¿Es compatible con cualquier theme?</strong> Funciona con Online Store 2.0. En themes muy custom puede requerir ajustes mínimos.
                    </List.Item>
                    <List.Item>
                      <strong>¿Cómo lo desinstalo?</strong> Desactiva los app embeds y elimina las secciones del Theme Editor. Luego desinstala la app.
                    </List.Item>
                  </List>

                  <Divider />

                  <Text variant="headingSm" as="h3">Troubleshooting</Text>
                  <List type="bullet">
                    <List.Item>
                      <strong>No se ve en preview:</strong> Save → hard refresh → vuelve a abrir el editor.
                    </List.Item>
                    <List.Item>
                      <strong>No rota mensajes:</strong> activa “Rotar mensajes” y sube “Cada (segundos)”.
                    </List.Item>
                    <List.Item>
                      <strong>Se duplica contador/mensajes:</strong> desactiva “Incluir contador en rotación” si quieres el contador fijo.
                    </List.Item>
                    <List.Item>
                      <strong>Dev/VS no sincroniza:</strong> detén y corre de nuevo <code>shopify app dev</code>.
                    </List.Item>
                    <List.Item>
                      <strong>La TopBar no aparece:</strong> confirma que estás en <em>App embeds</em> (no en Sections) y que está activada.
                    </List.Item>
                    <List.Item>
                      <strong>Hay “hueco” arriba del header:</strong> apaga “Sticky” o baja altura/padding; revisa si tu header es sticky también.
                    </List.Item>
                    <List.Item>
                      <strong>El CTA no abre:</strong> revisa que el link sea válido (con https://) y que no esté vacío.
                    </List.Item>
                    <List.Item>
                      <strong>Iconos no se ven:</strong> usa solo nombres soportados (ej. truck/shield/lock/tag). Si escribes otro, se oculta.
                    </List.Item>
                  </List>

                  <InlineStack gap="200" wrap>
                    <Button variant="primary" onClick={() => open("https://bloqio.app/support")}>Soporte Bloqio</Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            </Layout.Section>

            <Layout.Section variant="oneThird">
              <Card padding="400">
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">Estado</Text>
                  <Text as="p" tone="subdued">
                    Store: <strong>{storeHandle || "detectando…"}</strong>
                  </Text>
                  <Text as="p" tone="subdued">
                    Si ves la UI “sin estilos”, recarga la app. Si persiste, reinicia tu servidor local con <code>shopify app dev</code>.
                  </Text>
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        </Page>
      </Frame>
    </AppProvider>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

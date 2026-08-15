const PRINTFUL_API = "https://api.printful.com";

function headers() {
  return {
    Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    "Content-Type": "application/json",
  };
}

type CreateTaskParams = {
  printfulProductId: number;
  variantIds: number[];
  placement: string;
  imageUrl: string;
};

// Dispara la generación del mockup. Printful la procesa en segundo plano.
export async function createMockupTask({
  printfulProductId,
  variantIds,
  placement,
  imageUrl,
}: CreateTaskParams): Promise<string> {
  const res = await fetch(
    `${PRINTFUL_API}/mockup-generator/create-task/${printfulProductId}`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        variant_ids: variantIds,
        format: "jpg",
        files: [{ placement, image_url: imageUrl }],
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Printful create-task falló: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  return json.result.task_key as string;
}

export type MockupResult = {
  status: "pending" | "completed" | "failed";
  mockupUrl?: string;
};

// Consulta el estado de la tarea. Printful tarda unos segundos en generar la imagen.
export async function getMockupTask(taskKey: string): Promise<MockupResult> {
  const res = await fetch(`${PRINTFUL_API}/mockup-generator/task?task_key=${taskKey}`, {
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error(`Printful get-task falló: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  const result = json.result;

  if (result.status === "completed") {
    return { status: "completed", mockupUrl: result.mockups?.[0]?.mockup_url };
  }
  if (result.status === "failed") {
    return { status: "failed" };
  }
  return { status: "pending" };
}

// Espera hasta ~15s a que el mockup esté listo, con reintentos cortos.
export async function createAndWaitMockup(params: CreateTaskParams): Promise<MockupResult> {
  const taskKey = await createMockupTask(params);

  for (let i = 0; i < 8; i++) {
    const result = await getMockupTask(taskKey);
    if (result.status !== "pending") return result;
    await new Promise((r) => setTimeout(r, 1800));
  }
  return { status: "pending" };
}

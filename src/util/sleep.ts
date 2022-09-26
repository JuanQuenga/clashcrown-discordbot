export async function sleep(ms: number): Promise<{}> {
  return new Promise((resolve: resolveFn): number => setTimeout(resolve, ms));
}

type resolveFn = (thenableOrResult?: {} | PromiseLike<{}>) => void;

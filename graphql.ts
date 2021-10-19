import { assert } from './assert.js';

export type TGenericPayload = {
  node?: any | null,
  error?: TGenericPayloadError | null,
};

export type TGenericPayloadError = { message?: string, code: string };

export type TMutationResponse = {
  __typename: 'Mutation',
  [key: string]: TGenericPayload | 'Mutation',
};

type SuccessPayload<T extends TGenericPayload> = {
  node: NonNullable<T['node']>,
  error: null,
};

export type SuccessResponse<T extends TMutationResponse> = {
  [K in keyof T]: T[K] extends TGenericPayload ? SuccessPayload<T[K]> : T[K]
};

/**
 * Throws an error if one of the payloads returned by the mutation has an error.
 *
 * @param queriedData the 'data' part of the graphql response
 * @returns {SuccessResponse<Response>} the same object, but TypeScript knows that the error field of payloads is null, and the node field is not null.
 */
export function processMutationData<Response extends TMutationResponse>(queriedData: Response): SuccessResponse<Response> {
  assert(queriedData != null);

  const payloadError = getPayloadError(queriedData);
  if (payloadError != null) {
    const error = new Error(`${payloadError.message ?? 'GraphQL request failure'} (${payloadError.code})`);
    // @ts-expect-error
    error.code = payloadError.code;

    throw error;
  }

  // @ts-expect-error
  return queriedData;
}

export function getPayloadError(queriedData: TMutationResponse): TGenericPayloadError | null {
  const keys = Object.keys(queriedData).filter(k => k !== '__typename');

  for (const key of keys) {
    const payload = queriedData[key];

    assert(payload !== 'Mutation');

    if (payload.error) {
      return payload.error;
    }
  }

  return null;
}

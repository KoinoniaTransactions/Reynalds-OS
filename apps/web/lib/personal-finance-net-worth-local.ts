export type PersonalFinanceAssetValue = {
  id: string;
  name: string;
  valueCents: number;
};

export type PersonalFinanceLiabilityValue = {
  id: string;
  name: string;
  currentBalanceCents: number;
  linkedAssetId?: string | null;
};

export type PersonalFinanceAssetEquity = {
  assetId: string;
  assetName: string;
  assetValueCents: number;
  linkedLiabilityCents: number;
  equityCents: number;
};

export type PersonalFinanceNetWorth = {
  totalAssetsCents: number;
  totalLiabilitiesCents: number;
  netWorthCents: number;
  assetEquity: PersonalFinanceAssetEquity[];
  unlinkedLiabilityCents: number;
};

function nonnegativeInteger(
  value: number,
  label: string
): number {
  if (
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    throw new Error(
      `${label} must be a nonnegative integer number of cents.`
    );
  }

  return value;
}

export function calculatePersonalFinanceNetWorth(
  assets:
    readonly PersonalFinanceAssetValue[],
  liabilities:
    readonly PersonalFinanceLiabilityValue[]
): PersonalFinanceNetWorth {
  const assetIds = new Set<string>();

  const normalizedAssets =
    assets.map((asset) => {
      if (!asset.id.trim()) {
        throw new Error(
          "Every asset must have an ID."
        );
      }

      if (assetIds.has(asset.id)) {
        throw new Error(
          `Duplicate asset ID: ${asset.id}`
        );
      }

      assetIds.add(asset.id);

      return {
        ...asset,
        valueCents:
          nonnegativeInteger(
            asset.valueCents,
            `${asset.name} value`
          )
      };
    });

  const normalizedLiabilities =
    liabilities.map(
      (liability) => ({
        ...liability,
        currentBalanceCents:
          nonnegativeInteger(
            liability
              .currentBalanceCents,
            `${liability.name} balance`
          )
      })
    );

  const totalAssetsCents =
    normalizedAssets.reduce(
      (total, asset) =>
        total + asset.valueCents,
      0
    );

  const totalLiabilitiesCents =
    normalizedLiabilities.reduce(
      (total, liability) =>
        total +
        liability.currentBalanceCents,
      0
    );

  const liabilitiesByAsset =
    new Map<string, number>();

  let unlinkedLiabilityCents = 0;

  for (
    const liability
    of normalizedLiabilities
  ) {
    const linkedAssetId =
      liability.linkedAssetId?.trim();

    if (
      !linkedAssetId ||
      !assetIds.has(linkedAssetId)
    ) {
      unlinkedLiabilityCents +=
        liability.currentBalanceCents;

      continue;
    }

    liabilitiesByAsset.set(
      linkedAssetId,
      (
        liabilitiesByAsset.get(
          linkedAssetId
        ) ?? 0
      ) +
        liability.currentBalanceCents
    );
  }

  const assetEquity =
    normalizedAssets.map(
      (asset) => {
        const linkedLiabilityCents =
          liabilitiesByAsset.get(
            asset.id
          ) ?? 0;

        return {
          assetId: asset.id,
          assetName: asset.name,
          assetValueCents:
            asset.valueCents,
          linkedLiabilityCents,
          equityCents:
            asset.valueCents -
            linkedLiabilityCents
        };
      }
    );

  return {
    totalAssetsCents,
    totalLiabilitiesCents,
    netWorthCents:
      totalAssetsCents -
      totalLiabilitiesCents,
    assetEquity,
    unlinkedLiabilityCents
  };
}

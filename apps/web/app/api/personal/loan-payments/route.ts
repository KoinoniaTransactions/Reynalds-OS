import {
  NextResponse
} from "next/server";

import {
  applyLoanPayment,
  configureLoanTerms
} from "../../../../lib/personal-finance-loan-ledger-local";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json() as {
        action?:
          | "configure"
          | "apply-payment";
        [key: string]: unknown;
      };

    if (
      body.action === "configure"
    ) {
      configureLoanTerms(
        body as never
      );

      return NextResponse.json({
        ok: true
      });
    }

    if (
      body.action ===
        "apply-payment"
    ) {
      const payment =
        applyLoanPayment(
          body as never
        );

      return NextResponse.json({
        ok: true,
        payment
      });
    }

    return NextResponse.json(
      {
        error:
          "Action must be configure or apply-payment."
      },
      {
        status: 400
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Loan payment could not be processed."
      },
      {
        status: 400
      }
    );
  }
}

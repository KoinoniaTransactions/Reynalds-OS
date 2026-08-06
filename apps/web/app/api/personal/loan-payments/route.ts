import {
  NextResponse
} from "next/server";

import {
  applyLoanPayment,
  configureLoanTerms,
  previewLoanPayment,
  readLoanPaymentWorkspace
} from "../../../../lib/personal-finance-loan-ledger-local";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({
      records:
        readLoanPaymentWorkspace()
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Loan-payment information could not be loaded."
      },
      {
        status: 400
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json() as {
        action?:
          | "configure"
          | "preview-payment"
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
        "preview-payment"
    ) {
      return NextResponse.json({
        ok: true,
        preview:
          previewLoanPayment(
            body as never
          )
      });
    }

    if (
      body.action ===
        "apply-payment"
    ) {
      return NextResponse.json({
        ok: true,
        payment:
          applyLoanPayment(
            body as never
          )
      });
    }

    return NextResponse.json(
      {
        error:
          "Action must be configure, preview-payment, or apply-payment."
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

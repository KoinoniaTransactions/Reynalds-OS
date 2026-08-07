import {
  NextResponse
} from "next/server";

import {
  applyLoanPayment,
  configureLoanTerms,
  modelLoanScenario,
  previewLoanPayment,
  readLoanPaymentWorkspace,
  reconcileLoanStatement
} from "../../../../lib/personal-finance-loan-ledger-local";

import {
  syncPersonalFinanceDebtPayment
} from "../../../../lib/personal-finance-reconciliation-local";

export const dynamic =
  "force-dynamic";

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
          | "apply-payment"
          | "reconcile-statement"
          | "model-scenario";

        periodKey?:
          unknown;

        note?:
          unknown;

        [key: string]:
          unknown;
      };

    if (
      body.action ===
      "configure"
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
      const payment =
        applyLoanPayment(
          body as never
        );

      let periodSync:
        {
          synced: boolean;
          error?: string;
        } | null =
        null;

      if (
        typeof body.periodKey ===
          "string" &&
        body.periodKey.trim() &&
        payment.obligationId
      ) {
        try {
          const sync =
            syncPersonalFinanceDebtPayment(
              body.periodKey,
              {
                obligationId:
                  payment.obligationId,

                paymentId:
                  payment.paymentId,

                amount:
                  payment.totalPayment,

                paidOn:
                  payment.paidOn,

                note:
                  typeof body.note ===
                  "string"
                    ? body.note
                    : null
              }
            );

          periodSync = {
            synced:
              sync.synced
          };
        } catch (
          syncError
        ) {
          periodSync = {
            synced:
              false,

            error:
              syncError instanceof
                Error
                ? syncError.message
                : "The debt payment was applied, but the monthly bill could not be synchronized."
          };
        }
      }

      return NextResponse.json({
        ok: true,
        payment,
        periodSync
      });
    }

    if (
      body.action ===
      "model-scenario"
    ) {
      return NextResponse.json({
        ok: true,

        scenario:
          modelLoanScenario(
            body as never
          )
      });
    }

    if (
      body.action ===
      "reconcile-statement"
    ) {
      reconcileLoanStatement(
        body as never
      );

      return NextResponse.json({
        ok: true
      });
    }

    return NextResponse.json(
      {
        error:
          "Action must be configure, preview-payment, apply-payment, reconcile-statement, or model-scenario."
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
            : "Loan request could not be processed."
      },
      {
        status: 400
      }
    );
  }
}

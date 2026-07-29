import { describe, expect, it } from "vitest";
import { validateObjectCreate, validateObjectUpdate } from "./validation";

describe("object validation", () => {
  it("accepts explicit client and staff assignment fields", () => {
    expect(
      validateObjectCreate({
        assignedStaffUserId: "usr_staff",
        backupStaffUserId: "usr_backup",
        clientObjectId: "obj_client",
        clientUserId: "usr_client",
        name: "Smith Contract-to-Close",
        objectType: "Transaction"
      })
    ).toMatchObject({
      assignedStaffUserId: "usr_staff",
      backupStaffUserId: "usr_backup",
      clientObjectId: "obj_client",
      clientUserId: "usr_client",
      name: "Smith Contract-to-Close",
      objectType: "Transaction"
    });
  });

  it("allows assignment fields in object updates", () => {
    expect(
      validateObjectUpdate({
        assignedStaffUserId: "usr_staff",
        backupStaffUserId: "usr_backup",
        clientObjectId: "obj_client",
        clientUserId: "usr_client"
      })
    ).toEqual({
      assignedStaffUserId: "usr_staff",
      backupStaffUserId: "usr_backup",
      clientObjectId: "obj_client",
      clientUserId: "usr_client"
    });
  });
});

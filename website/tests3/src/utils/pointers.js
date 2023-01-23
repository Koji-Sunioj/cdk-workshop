export const postStatePointer = {
  error: { message: "There was an error", variant: "error" },
  posting: { message: "Creating...", variant: "info" },
  posted: { message: "Created!", variant: "success" },
  patching: { message: "Updating...", variant: "info" },
  patched: { message: "Updated!", variant: "success" },
};

export const signInPointer = {
  success: "successfully logged in",
  danger: "mismatch password, or user doesn't exist",
};

export const resetPointer = {
  success: "successfully reset password",
  danger: "mismatch password, or doesn't meet requirements",
};

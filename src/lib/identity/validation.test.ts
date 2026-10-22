import { describe, expect, it } from "vitest";
import {
  formatCpf,
  isValidCpf,
  isValidCredentialsInput,
  isValidProfileUpdate,
  parseRegistrationInput,
} from "./validation";

const validRegistration = {
  name: "Ana Cliente",
  email: "ana@example.test",
  password: "password-123",
  phone: "(11) 99999-9999",
  cpf_formatted: "52998224725",
  address: {
    postal_code: "01001000",
    street: "Praça da Sé",
    number: "100",
    district: "Sé",
    city: "São Paulo",
    state: "sp",
    shipping_region: "sp",
  },
};

describe("identity validation", () => {
  it("formats CPF while typing and validates its structure locally", () => {
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("529.982.247-24")).toBe(false);
  });

  it("normalizes registration data and formats the single address", () => {
    const result = parseRegistrationInput(validRegistration);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.email).toBe("ana@example.test");
      expect(result.value.cpf_formatted).toBe("529.982.247-25");
      expect(result.value.address.postal_code).toBe("01001-000");
    }
  });

  it("rejects malformed CPF, email and address inputs", () => {
    const result = parseRegistrationInput({
      ...validRegistration,
      email: "not-an-email",
      cpf_formatted: "11111111111",
      address: { ...validRegistration.address, state: "Sao Paulo" },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveProperty("email");
      expect(result.errors).toHaveProperty("cpf_formatted");
      expect(result.errors).toHaveProperty("state");
    }
  });

  it("validates credentials and profile updates", () => {
    expect(isValidCredentialsInput({ email: "a@example.test", password: "secret" })).toBe(true);
    expect(isValidCredentialsInput({ email: "bad", password: "secret" })).toBe(false);
    expect(
      isValidProfileUpdate({
        name: "Ana Cliente",
        phone: "11999999999",
        cpf_formatted: "529.982.247-25",
        address: validRegistration.address,
      }),
    ).toBe(true);
  });
});

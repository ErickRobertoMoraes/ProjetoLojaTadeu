export const SHIPPING_REGIONS = [
  "sp",
  "southeast",
  "south_center_west",
  "north_northeast",
] as const;

export type ShippingRegion = (typeof SHIPPING_REGIONS)[number];

export type AddressInput = {
  postal_code: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  shipping_region: ShippingRegion;
};

export type RegistrationInput = {
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf_formatted: string;
  address: AddressInput;
};

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: Record<string, string> };

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (!/^\d{11}$/.test(digits) || /^([0-9])\1{10}$/.test(digits)) return false;

  const checkDigit = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return checkDigit(9) === Number(digits[9]) && checkDigit(10) === Number(digits[10]);
}

export function parseRegistrationInput(input: unknown): ValidationResult<RegistrationInput> {
  const errors: Record<string, string> = {};
  if (!isRecord(input)) return { ok: false, errors: { form: "Dados inválidos." } };

  const address = isRecord(input.address) ? input.address : {};
  const name = text(input.name);
  const email = text(input.email).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";
  const phone = text(input.phone);
  const cpf_formatted = formatCpf(text(input.cpf_formatted));
  const postal_code = text(address.postal_code).replace(/\D/g, "");
  const street = text(address.street);
  const number = text(address.number);
  const complement = text(address.complement);
  const district = text(address.district);
  const city = text(address.city);
  const state = text(address.state).toUpperCase();
  const shipping_region = text(address.shipping_region) as ShippingRegion;

  if (name.length < 1 || name.length > 160) errors.name = "Informe seu nome.";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Informe um e-mail válido.";
  }
  if (password.length < 8 || password.length > 72) {
    errors.password = "A senha deve ter entre 8 e 72 caracteres.";
  }
  if (phone.replace(/\D/g, "").length < 10 || phone.replace(/\D/g, "").length > 13) {
    errors.phone = "Informe um telefone válido com DDD.";
  }
  if (!isValidCpf(cpf_formatted)) errors.cpf_formatted = "Informe um CPF estruturalmente válido.";
  if (!/^\d{8}$/.test(postal_code)) errors.postal_code = "Informe um CEP com 8 dígitos.";
  if (!street || street.length > 200) errors.street = "Informe o logradouro.";
  if (!number || number.length > 32) errors.number = "Informe o número.";
  if (complement.length > 160) errors.complement = "Complemento muito longo.";
  if (!district || district.length > 120) errors.district = "Informe o bairro.";
  if (!city || city.length > 120) errors.city = "Informe a cidade.";
  if (!/^[A-Z]{2}$/.test(state)) errors.state = "Informe a UF com duas letras.";
  if (!(SHIPPING_REGIONS as readonly string[]).includes(shipping_region)) {
    errors.shipping_region = "Selecione uma região de entrega.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name,
      email,
      password,
      phone,
      cpf_formatted,
      address: {
        postal_code: `${postal_code.slice(0, 5)}-${postal_code.slice(5)}`,
        street,
        number,
        ...(complement ? { complement } : {}),
        district,
        city,
        state,
        shipping_region,
      },
    },
  };
}

export function isValidCredentialsInput(input: unknown): input is { email: string; password: string } {
  if (!isRecord(input)) return false;
  return (
    typeof input.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) &&
    typeof input.password === "string" &&
    input.password.length > 0 &&
    input.password.length <= 72
  );
}

export function isValidProfileUpdate(
  input: unknown,
): input is { name: string; phone: string; cpf_formatted: string; address: AddressInput } {
  if (!isRecord(input)) return false;
  const parsed = parseRegistrationInput({
    ...input,
    email: "profile@example.test",
    password: "placeholder-password",
  });
  return parsed.ok;
}

export function isValidAddressUpdate(input: unknown): input is AddressInput {
  if (!isRecord(input)) return false;
  const parsed = parseRegistrationInput({
    name: "Profile",
    email: "profile@example.test",
    password: "placeholder-password",
    phone: "11999999999",
    cpf_formatted: "52998224725",
    address: input,
  });
  return parsed.ok;
}

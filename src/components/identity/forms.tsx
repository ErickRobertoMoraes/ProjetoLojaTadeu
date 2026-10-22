"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatCpf, type AddressInput } from "@/lib/identity/validation";

type Message = { text: string; isError: boolean } | null;

async function submitJson(url: string, method: string, body: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = (await response.json().catch(() => ({}))) as { error?: string; fields?: Record<string, string> };
  return { response, result };
}

function messageFor(error: string | undefined) {
  switch (error) {
    case "email_unconfirmed":
      return "Confirme seu e-mail antes de entrar e iniciar uma compra.";
    case "invalid_credentials":
      return "E-mail ou senha inválidos.";
    case "signup_failed":
      return "Não foi possível criar a conta. Verifique se o e-mail já está cadastrado.";
    case "validation_failed":
      return "Revise os dados informados e tente novamente.";
    default:
      return "Não foi possível concluir a solicitação. Tente novamente.";
  }
}

function Feedback({ message }: { message: Message }) {
  if (!message) return null;
  return (
    <p className={message.isError ? "form-error" : "form-success"} role="status" aria-live="polite">
      {message.text}
    </p>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = true,
  autoComplete,
  maxLength,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="form-field" htmlFor={name}>
      <span>{label}</span>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        inputMode={inputMode}
      />
    </label>
  );
}

export function RegistrationForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    cpf_formatted: "",
    postal_code: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
    shipping_region: "sp",
  });
  const set = (field: keyof typeof values, value: string) => setValues((current) => ({ ...current, [field]: value }));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const address: AddressInput = {
      postal_code: values.postal_code,
      street: values.street,
      number: values.number,
      complement: values.complement,
      district: values.district,
      city: values.city,
      state: values.state,
      shipping_region: values.shipping_region as AddressInput["shipping_region"],
    };
    try {
      const { response, result } = await submitJson("/api/auth/signup", "POST", {
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
        cpf_formatted: values.cpf_formatted,
        address,
      });
      if (!response.ok) {
        setMessage({ text: messageFor(result.error), isError: true });
      } else {
        setMessage({ text: "Conta criada. Confira seu e-mail para confirmar o cadastro.", isError: false });
        window.setTimeout(() => router.push("/entrar?cadastro=1"), 1200);
      }
    } catch {
      setMessage({ text: "Serviço indisponível. Tente novamente em instantes.", isError: true });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="identity-form" onSubmit={onSubmit}>
      <Field label="Nome completo" name="name" value={values.name} onChange={(value) => set("name", value)} maxLength={160} autoComplete="name" />
      <Field label="E-mail" name="email" type="email" value={values.email} onChange={(value) => set("email", value)} autoComplete="email" />
      <Field label="Senha (mínimo 8 caracteres)" name="password" type="password" value={values.password} onChange={(value) => set("password", value)} autoComplete="new-password" maxLength={72} />
      <Field label="Telefone com DDD" name="phone" type="tel" value={values.phone} onChange={(value) => set("phone", value)} autoComplete="tel" maxLength={24} />
      <Field label="CPF" name="cpf_formatted" value={values.cpf_formatted} onChange={(value) => set("cpf_formatted", formatCpf(value))} inputMode="numeric" maxLength={14} />
      <h2>Endereço de entrega</h2>
      <Field label="CEP" name="postal_code" value={values.postal_code} onChange={(value) => set("postal_code", value)} autoComplete="postal-code" maxLength={9} />
      <Field label="Logradouro" name="street" value={values.street} onChange={(value) => set("street", value)} autoComplete="address-line1" maxLength={200} />
      <Field label="Número" name="number" value={values.number} onChange={(value) => set("number", value)} maxLength={32} />
      <Field label="Complemento (opcional)" name="complement" value={values.complement} onChange={(value) => set("complement", value)} required={false} maxLength={160} />
      <Field label="Bairro" name="district" value={values.district} onChange={(value) => set("district", value)} maxLength={120} />
      <Field label="Cidade" name="city" value={values.city} onChange={(value) => set("city", value)} autoComplete="address-level2" maxLength={120} />
      <Field label="UF" name="state" value={values.state} onChange={(value) => set("state", value.toUpperCase().slice(0, 2))} autoComplete="address-level1" maxLength={2} />
      <label className="form-field" htmlFor="shipping_region">
        <span>Região de entrega</span>
        <select id="shipping_region" value={values.shipping_region} onChange={(event) => set("shipping_region", event.target.value)}>
          <option value="sp">São Paulo</option>
          <option value="southeast">Demais Sudeste</option>
          <option value="south_center_west">Sul e Centro-Oeste</option>
          <option value="north_northeast">Norte e Nordeste</option>
        </select>
      </label>
      <Feedback message={message} />
      <button type="submit" disabled={pending}>{pending ? "Criando conta…" : "Criar conta"}</button>
    </form>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const { response, result } = await submitJson("/api/auth/login", "POST", { email, password });
      if (!response.ok) setMessage({ text: messageFor(result.error), isError: true });
      else router.push("/perfil");
    } catch {
      setMessage({ text: "Serviço indisponível. Tente novamente em instantes.", isError: true });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="identity-form" onSubmit={onSubmit}>
      <Field label="E-mail" name="email" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <Field label="Senha" name="password" type="password" value={password} onChange={setPassword} autoComplete="current-password" maxLength={72} />
      <Feedback message={message} />
      <button type="submit" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}

export function RecoveryForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const { response } = await submitJson("/api/auth/recovery", "POST", { email });
      setMessage({
        text: response.ok ? "Se houver uma conta para esse e-mail, enviaremos as instruções de recuperação." : "Informe um e-mail válido.",
        isError: !response.ok,
      });
    } catch {
      setMessage({ text: "Serviço indisponível. Tente novamente em instantes.", isError: true });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="identity-form" onSubmit={onSubmit}>
      <Field label="E-mail cadastrado" name="email" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <Feedback message={message} />
      <button type="submit" disabled={pending}>{pending ? "Enviando…" : "Enviar instruções"}</button>
    </form>
  );
}

export function PasswordUpdateForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const { response } = await submitJson("/api/auth/password", "PATCH", { password });
      if (response.ok) {
        setMessage({ text: "Senha atualizada. Faça login novamente.", isError: false });
        window.setTimeout(() => router.push("/entrar"), 1000);
      } else setMessage({ text: "A senha deve ter entre 8 e 72 caracteres e a sessão precisa ser válida.", isError: true });
    } catch {
      setMessage({ text: "Serviço indisponível. Tente novamente em instantes.", isError: true });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="identity-form" onSubmit={onSubmit}>
      <Field label="Nova senha (mínimo 8 caracteres)" name="password" type="password" value={password} onChange={setPassword} autoComplete="new-password" maxLength={72} />
      <Feedback message={message} />
      <button type="submit" disabled={pending}>{pending ? "Salvando…" : "Atualizar senha"}</button>
    </form>
  );
}

export function ProfileForm({
  profile,
  address,
}: {
  profile: { name: string; phone: string; cpf_formatted: string };
  address: AddressInput;
}) {
  const router = useRouter();
  const [values, setValues] = useState({ ...profile, ...address });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const set = (field: keyof typeof values, value: string) => setValues((current) => ({ ...current, [field]: value }));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const { response } = await submitJson("/api/profile", "PATCH", {
        name: values.name,
        phone: values.phone,
        cpf_formatted: values.cpf_formatted,
        address: {
          postal_code: values.postal_code,
          street: values.street,
          number: values.number,
          complement: values.complement,
          district: values.district,
          city: values.city,
          state: values.state,
          shipping_region: values.shipping_region,
        },
      });
      setMessage({ text: response.ok ? "Perfil atualizado." : "Não foi possível atualizar. Revise os dados.", isError: !response.ok });
      if (response.ok) router.refresh();
    } catch {
      setMessage({ text: "Serviço indisponível. Tente novamente em instantes.", isError: true });
    } finally {
      setPending(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/entrar");
    router.refresh();
  }

  return (
    <>
      <form className="identity-form" onSubmit={onSubmit}>
        <Field label="Nome completo" name="name" value={values.name} onChange={(value) => set("name", value)} maxLength={160} />
        <Field label="Telefone" name="phone" type="tel" value={values.phone} onChange={(value) => set("phone", value)} maxLength={24} />
        <Field label="CPF" name="cpf_formatted" value={values.cpf_formatted} onChange={(value) => set("cpf_formatted", formatCpf(value))} maxLength={14} />
        <h2>Endereço de entrega</h2>
        <Field label="CEP" name="postal_code" value={values.postal_code} onChange={(value) => set("postal_code", value)} maxLength={9} />
        <Field label="Logradouro" name="street" value={values.street} onChange={(value) => set("street", value)} maxLength={200} />
        <Field label="Número" name="number" value={values.number} onChange={(value) => set("number", value)} maxLength={32} />
        <Field label="Complemento (opcional)" name="complement" value={values.complement ?? ""} onChange={(value) => set("complement", value)} required={false} maxLength={160} />
        <Field label="Bairro" name="district" value={values.district} onChange={(value) => set("district", value)} maxLength={120} />
        <Field label="Cidade" name="city" value={values.city} onChange={(value) => set("city", value)} maxLength={120} />
        <Field label="UF" name="state" value={values.state} onChange={(value) => set("state", value.toUpperCase().slice(0, 2))} maxLength={2} />
        <label className="form-field" htmlFor="shipping_region">
          <span>Região de entrega</span>
          <select id="shipping_region" value={values.shipping_region} onChange={(event) => set("shipping_region", event.target.value as AddressInput["shipping_region"])}>
            <option value="sp">São Paulo</option>
            <option value="southeast">Demais Sudeste</option>
            <option value="south_center_west">Sul e Centro-Oeste</option>
            <option value="north_northeast">Norte e Nordeste</option>
          </select>
        </label>
        <Feedback message={message} />
        <button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar perfil"}</button>
      </form>
      <button className="secondary-button" type="button" onClick={logout}>Sair da conta</button>
    </>
  );
}

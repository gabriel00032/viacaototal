import { describe, it, expect } from "vitest";
import { makeSession, checkSession, sha256 } from "../src/lib/auth";

describe("autenticação admin", () => {
  it("cria e valida sessão íntegra", () => {
    const s = makeSession("admin");
    expect(checkSession(s)).toBe("admin");
  });
  it("rejeita sessão adulterada ou expirada", () => {
    const s = makeSession("admin");
    expect(checkSession(s + "x")).toBeNull();
    expect(checkSession("admin.1.abc")).toBeNull();
    expect(checkSession(undefined)).toBeNull();
  });
  it("hash sha256 determinístico", () => {
    expect(sha256("admin123")).toBe(sha256("admin123"));
    expect(sha256("admin123")).not.toBe(sha256("outra"));
  });
});

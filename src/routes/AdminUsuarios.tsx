import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

interface Usuario {
  nome: string;
  email: string;
  senha: string;
  numero: string;
  pedido: string;
}

function AdminUsuarios() {
  const [formData, setFormData] = useState<Usuario>({
    nome: "",
    email: "",
    senha: "",
    numero: "",
    pedido: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://192.168.0.72:8080/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Usuário cadastrado com sucesso!");
        setFormData({ nome: "", email: "", senha: "", numero: "", pedido: "" });
      } else {
        alert("Erro ao cadastrar usuário");
      }
    } catch (error) {
      console.error(error);
      alert("Falha na conexão com o servidor");
    }
  };

  return (
    <div className="glass mx-auto mt-28 w-[calc(100%-2rem)] max-w-lg rounded-2xl p-5 sm:p-6">
      <h2 className="mb-5 text-2xl font-black text-center">Cadastro de Usuários</h2>
      <form onSubmit={handleSubmit} className="grid gap-3">
        <label className="grid gap-1 text-sm font-semibold">Nome:
        <input className="input-dark" type="text" name="nome" value={formData.nome} onChange={handleChange} required />
        </label>

        <label className="grid gap-1 text-sm font-semibold">Email:
        <input className="input-dark" type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>

        <label className="grid gap-1 text-sm font-semibold">Senha:
        <input className="input-dark" type="password" name="senha" value={formData.senha} onChange={handleChange} required />
        </label>

        <label className="grid gap-1 text-sm font-semibold">Número:
        <input className="input-dark" type="text" name="numero" value={formData.numero} onChange={handleChange} required />
        </label>

        <label className="grid gap-1 text-sm font-semibold">Pedido:
        <textarea className="input-dark resize-none" rows={4} name="pedido" value={formData.pedido} onChange={handleChange} required />
        </label>

        <button type="submit" className="btn-hero btn-hero-hover mt-2 w-full">
          Salvar
        </button>
      </form>
    </div>
  );
}

export const Route = createFileRoute("/AdminUsuarios")({
  head: () => ({
    meta: [
      { title: "Admin Usuários — Nova Bll do Brasil" },
      { name: "description", content: "Área administrativa de cadastro de usuários." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: AdminUsuarios,
});

export default AdminUsuarios;

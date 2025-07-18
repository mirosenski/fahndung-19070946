"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Edit, Trash2, User, Mail } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/api";
import { UserDialog } from "./UserDialog";

export function UserManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<{ id: string; name?: string; email: string; role: "ADMIN" | "USER" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // tRPC Queries und Mutations
  const { data: users, isLoading, refetch } = api.user.list.useQuery();
  const createUserMutation = api.user.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateDialogOpen(false);
    },
  });
  const updateUserMutation = api.user.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingUser(null);
    },
  });
  const deleteUserMutation = api.user.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleCreateUser = (userData: { name?: string; email: string; role: "ADMIN" | "USER" }) => {
    createUserMutation.mutate(userData);
  };

  const handleUpdateUser = (userData: { id?: string; name?: string; email?: string; role?: "ADMIN" | "USER" }) => {
    if (!userData.id) {
      alert("Fehler: Benutzer-ID fehlt!");
      return;
    }
    updateUserMutation.mutate(userData as { id: string; name?: string; email?: string; role?: "ADMIN" | "USER" });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?")) {
      deleteUserMutation.mutate({ id: userId });
    }
  };

  const handleEditUser = (user: { id: string; name?: string | null; email: string; role: "ADMIN" | "USER" }) => {
    setEditingUser({
      ...user,
      name: user.name || undefined
    });
  };

  const filteredUsers = users?.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl">Benutzerverwaltung</CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Input
                placeholder="Benutzer suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
              <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Benutzer hinzufügen</span>
                <span className="sm:hidden">Hinzufügen</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Name</th>
                  <th className="text-left py-2 px-2">E-Mail</th>
                  <th className="text-left py-2 px-2">Rolle</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{user.name || "Unbekannt"}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <Badge variant={user.role === "ADMIN" ? "destructive" : "secondary"}>
                        <Image
                          src="/logo.svg"
                          alt="Fahndung Logo"
                          width={12}
                          height={12}
                          className="w-3 h-3 mr-1"
                        />
                        {user.role === "ADMIN" ? "Administrator" : "Benutzer"}
                      </Badge>
                    </td>
                    <td className="py-2 px-2">
                      <Badge variant="default">Aktiv</Badge>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>



      {/* Dialogs */}
      {isCreateDialogOpen && (
        <UserDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreateUser}
          title="Benutzer hinzufügen"
          submitLabel="Erstellen"
        />
      )}

      {editingUser && (
        <UserDialog
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdateUser}
          title="Benutzer bearbeiten"
          user={editingUser}
          submitLabel="Speichern"
        />
      )}
    </div>
  );
} 
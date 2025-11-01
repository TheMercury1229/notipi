import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/dashboard/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  subject: string;
}

const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Welcome Email",
    slug: "welcome-email",
    createdAt: "2024-01-15",
    subject: "Welcome to NotiPi!",
  },
  {
    id: "2",
    name: "Password Reset",
    slug: "password-reset",
    createdAt: "2024-01-18",
    subject: "Reset Your Password",
  },
  {
    id: "3",
    name: "Invoice Receipt",
    slug: "invoice-receipt",
    createdAt: "2024-01-20",
    subject: "Your Invoice from NotiPi",
  },
];

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [templates] = useState<Template[]>(mockTemplates);

  const handleEdit = (template: Template) => {
    navigate(`/dashboard/templates/edit/${template.id}`);
  };

  const handleCreateNew = () => {
    setIsCreateOpen(false);
    navigate("/dashboard/templates/new");
  };

  return (
    <div className="flex-1 overflow-auto">
      <Navbar
        title="Templates"
        showCreateButton
        onCreateClick={() => setIsCreateOpen(true)}
      />

      <main className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      {template.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{template.slug}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {template.subject}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Create Template Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Add a new email template to your collection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input id="name" placeholder="Welcome Email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input id="subject" placeholder="Welcome to our platform!" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (auto-generated)</Label>
              <Input id="slug" placeholder="welcome-email" disabled />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNew}>Create Template</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

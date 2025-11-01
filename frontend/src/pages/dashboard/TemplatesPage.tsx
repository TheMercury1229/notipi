import { useState, useEffect } from "react";
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
import { Edit, Trash2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { templateService } from "@/lib/api.service";
import { Textarea } from "@/components/ui/textarea";

interface Template {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  subject?: string;
  content: string;
  description?: string;
  isPublic: boolean;
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Form state
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
    description: "",
    isPublic: false,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setFetchLoading(true);
      const response = await templateService.getAllTemplates();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch templates");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleEdit = (template: Template) => {
    navigate(`/dashboard/templates/edit/${template._id}`, {
      state: { template },
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await templateService.deleteTemplate(id);
      if (response.success) {
        toast.success("Template deleted successfully!");
        await fetchTemplates();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete template");
    }
  };

  const handleCreateManual = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast.error("Name and content are required");
      return;
    }

    try {
      setLoading(true);
      const response = await templateService.createTemplate({
        name: newTemplate.name,
        content: newTemplate.content,
        description: newTemplate.description,
        isPublic: newTemplate.isPublic,
      });

      if (response.success) {
        toast.success("Template created successfully!");
        setIsCreateOpen(false);
        setNewTemplate({
          name: "",
          subject: "",
          content: "",
          description: "",
          isPublic: false,
        });
        await fetchTemplates();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    try {
      setAiLoading(true);
      const response = await templateService.createTemplateWithAI(aiPrompt);

      if (response.success) {
        toast.success("Template generated with AI successfully!");
        setIsAIDialogOpen(false);
        setAiPrompt("");
        await fetchTemplates();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to generate template with AI"
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <Navbar title="Templates" />

      <main className="p-6">
        <div className="mb-6 flex gap-3">
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Edit className="w-4 h-4" />
            Create Manual Template
          </Button>
          <Button
            onClick={() => setIsAIDialogOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate with AI
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
          </CardHeader>
          <CardContent>
            {fetchLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No templates found. Create your first template to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template._id}>
                      <TableCell className="font-medium">
                        {template.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{template.slug}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {template.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.isPublic ? "default" : "outline"}>
                          {template.isPublic ? "Public" : "Private"}
                        </Badge>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(template._id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create Manual Template Dialog */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setNewTemplate({
              name: "",
              subject: "",
              content: "",
              description: "",
              isPublic: false,
            });
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Add a new email template to your collection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                placeholder="Welcome Email"
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of this template"
                value={newTemplate.description}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">HTML Content *</Label>
              <Textarea
                id="content"
                placeholder="<html>...</html>"
                value={newTemplate.content}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, content: e.target.value })
                }
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={newTemplate.isPublic}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    isPublic: e.target.checked,
                  })
                }
                className="rounded"
              />
              <Label htmlFor="isPublic" className="cursor-pointer">
                Make this template public
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateManual} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Template"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate with AI Dialog */}
      <Dialog
        open={isAIDialogOpen}
        onOpenChange={(open) => {
          setIsAIDialogOpen(open);
          if (!open) setAiPrompt("");
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Template with AI
            </DialogTitle>
            <DialogDescription>
              Describe what kind of email template you need
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Template Description</Label>
              <Textarea
                id="prompt"
                placeholder="e.g., Create a welcome email for new users with a call-to-action button"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Be as specific as possible for better results
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAIDialogOpen(false)}
              disabled={aiLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateWithAI} disabled={aiLoading || !aiPrompt.trim()}>
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
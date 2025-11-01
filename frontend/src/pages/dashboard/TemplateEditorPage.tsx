import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Sparkles, Loader2 } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { templateService } from "@/lib/api.service";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TemplateEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [htmlContent, setHtmlContent] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #000; color: #fff; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .button { background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to NotiPi!</h1>
    </div>
    <div class="content">
      <p>Hi {{name}},</p>
      <p>Thank you for joining NotiPi. We're excited to help you send amazing notifications!</p>
      <p><a href="{{verify_link}}" class="button">Verify Email</a></p>
      <p>Best regards,<br>The NotiPi Team</p>
    </div>
    <div class="footer">
      <p>© 2024 NotiPi. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`);
  const [isPublic, setIsPublic] = useState(false);

  // AI Dialog state
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Load template if editing
  useEffect(() => {
    if (id && id !== "new") {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    try {
      setFetchLoading(true);
      const response = await templateService.getTemplateById(id!);
      
      if (response.success) {
        const template = response.data;
        setTemplateName(template.name);
        setHtmlContent(template.content);
        setDescription(template.description || "");
        setIsPublic(template.isPublic);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load template");
      navigate("/dashboard/templates");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error("Template name is required");
      return;
    }

    if (!htmlContent.trim()) {
      toast.error("HTML content is required");
      return;
    }

    try {
      setLoading(true);

      if (id === "new") {
        // Create new template
        const response = await templateService.createTemplate({
          name: templateName,
          content: htmlContent,
          description,
          isPublic,
        });

        if (response.success) {
          toast.success("Template created successfully!");
          navigate("/dashboard/templates");
        }
      } else {
        // Update existing template
        const response = await templateService.updateTemplate(id!, {
          name: templateName,
          content: htmlContent,
          description,
          isPublic,
        });

        if (response.success) {
          toast.success("Template updated successfully!");
          navigate("/dashboard/templates");
        }
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save template"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    try {
      setAiLoading(true);
      const response = await templateService.createTemplateWithAI(aiPrompt);

      if (response.success) {
        // Set the generated content to current template
        setHtmlContent(response.data.content);
        setTemplateName(response.data.name);
        setDescription(response.data.description || "");
        
        toast.success("Template generated with AI! Review and save.");
        setIsAIDialogOpen(false);
        setAiPrompt("");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to generate template with AI"
      );
    } finally {
      setAiLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard/templates")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">
                {id === "new" ? "Create Template" : "Edit Template"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {templateName || "Untitled Template"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsAIDialogOpen(true)}
            >
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </Button>
            <Button onClick={handleSave} className="gap-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Resizable Editor and Preview */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Editor Panel */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col p-6 overflow-auto">
            <div className="space-y-6 max-w-3xl">
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name *</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Welcome Email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this template"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isPublic" className="cursor-pointer">
                  Make this template public
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="htmlContent">HTML Content *</Label>
                <Textarea
                  id="htmlContent"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="font-mono text-sm min-h-[500px]"
                  placeholder="Enter your HTML template..."
                />
                <p className="text-xs text-muted-foreground">
                  Use variables like {`{{name}}`}, {`{{email}}`},{" "}
                  {`{{verify_link}}`} for dynamic content
                </p>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Preview Panel */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="border-b p-4 bg-muted/30">
              <h2 className="text-sm font-semibold">Live Preview</h2>
              <p className="text-xs text-muted-foreground">
                See how your email will look to recipients
              </p>
            </div>
            <div className="flex-1 p-6 overflow-auto bg-muted/10">
              <div className="max-w-2xl mx-auto bg-background rounded-lg shadow-lg">
                <div className="border-b p-4">
                  <div className="text-xs text-muted-foreground mb-1">
                    Template Preview:
                  </div>
                  <div className="font-medium">
                    {templateName || "Untitled Template"}
                  </div>
                </div>
                <div className="p-6">
                  <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

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
            <Button
              onClick={handleGenerateWithAI}
              disabled={aiLoading || !aiPrompt.trim()}
            >
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
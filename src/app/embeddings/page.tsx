'use client';

import { useCallback, useState } from 'react';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { Spinner } from '@nextui-org/spinner';
import { Tabs, Tab } from "@nextui-org/tabs";
import dynamic from 'next/dynamic';

import { useDocumentProcessor } from '@/hooks/embeddings/useDocumentProcessor';
import { FormButton } from '@/components/generics/form-button';
import { FormCard } from '@/components/generics/form-card';
import { Divider } from '@nextui-org/divider';

const KnowledgeBaseStats = dynamic(
  () => import('@/components/embeddings/kb-stats'),
  {
    ssr: false,
    loading: () => (
      <Card className="bg-charyo-500/60 backdrop-blur-sm p-4">
        <div className="flex items-center justify-center">
          <Spinner size="sm" />
          <span className="ml-2 text-notpurple-500">Loading stats...</span>
        </div>
      </Card>
    ),
  }
);

const DocumentManager = dynamic(
  () => import('@/components/embeddings/doc-manager'),
  {
    ssr: false,
    loading: () => (
      <Card className="bg-charyo-500/60 backdrop-blur-sm p-4">
        <div className="flex items-center justify-center">
          <Spinner size="sm" />
          <span className="ml-2 text-notpurple-500">Loading documents...</span>
        </div>
      </Card>
    ),
  }
);

const UploadForm = ({ 
  file, 
  setFile, 
  category, 
  setCategory, 
  processing, 
  status, 
  handleUpload 
}: {
  file: File | null;
  setFile: (file: File | null) => void;
  category: string;
  setCategory: (category: string) => void;
  processing: boolean;
  status: { type: string | null; message: string } | null;
  handleUpload: (e: React.FormEvent) => Promise<void>;
}) => (
  <FormCard title="Upload Document">
    <form onSubmit={handleUpload} className="space-y-4">
      <Input
        type="file"
        accept=".md,.txt"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full"
        classNames={{
          input: "text-notpurple-500",
          label: "text-notpurple-500",
          description: "text-notpurple-500/60"
        }}
        label="Upload Document"
        description="Supported formats: Markdown (.md), Text (.txt)"
      />
      <Input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Enter category (optional)"
        label="Category"
        classNames={{
          input: "text-notpurple-500",
          label: "text-notpurple-500"
        }}
      />
      <FormButton
        type="submit"
        disabled={!file || processing}
        className="w-full"
      >
        {processing ? (
          <Spinner size="sm" color="current" />
        ) : (
          'Upload and Generate Embedding'
        )}
      </FormButton>
      {status?.type && (
        <div className={`p-4 rounded ${
          status.type === 'success'
            ? 'bg-green-100/10 text-green-500'
            : 'bg-red-100/10 text-red-500'
        }`}>
          {status.message}
        </div>
      )}
    </form>
  </FormCard>
);

const Guidelines = () => (
  <Card className="bg-charyo-500/60 backdrop-blur-sm p-6">
    <CardHeader>
      <h2 className="text-xl font-semibold text-notpurple-500">Upload Guidelines</h2>
    </CardHeader>
    <CardBody>
      <ul className="list-disc list-inside space-y-2 text-notpurple-500/60">
        <li>Only markdown (.md) and text (.txt) files are supported</li>
        <li>Files should be in plain text format</li>
        <li>Category is optional but helps with organization</li>
        <li>Maximum file size: 5MB</li>
      </ul>
    </CardBody>
  </Card>
);

const EmbeddingsPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>("manage");

  const {
    processDocument,
    processing,
    status,
    error
  } = useDocumentProcessor();

  const handleTabChange = (key: React.Key) => {
    setSelectedTab(key.toString());
  };

  const handleUpload = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      await processDocument(file, category);
      setFile(null);
      setCategory('');
      
      // Reset to manage tab after upload - delete if annoying
      setSelectedTab("manage");
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [file, category, processDocument]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-notpurple-500">Document Embeddings Management</h1>
      
      <Tabs 
        aria-label="Document Management"
        classNames={{
          base: "w-full",
          tabList: "bg-charyo-500/60 backdrop-blur-sm border-none p-0",
          tab: "h-12 sm:h-10",
          tabContent: "text-notpurple-500/60 group-data-[selected=true]:text-notpurple-500",
          cursor: "bg-ualert-500",
          panel: "pt-3 px-0",
        }}
      >
        <Tab
          key="manage"
          title={
            <div className="flex items-center space-x-2">
              <span>Manage Documents</span>
            </div>
          }
        >
          <div className="flex flex-col space-y-6">
            <KnowledgeBaseStats />
            
            <Card className="bg-charyo-500/60 backdrop-blur-sm p-4">
              <CardHeader>
                <h3 className="text-lg font-semibold text-notpurple-500">Upload Guidelines</h3>
              </CardHeader>
              <CardBody>
                <ul className="list-disc list-inside space-y-2 text-notpurple-500">
                  <li>Only markdown (.md) and text (.txt) files are supported</li>
                  <li>Files should be in plain text format</li>
                  <li>Category is optional but helps with organization</li>
                  <li>Maximum file size: 5MB</li>
                </ul>
              </CardBody>
            </Card>

            <DocumentManager />
          </div>
        </Tab>
        
        <Tab
          key="upload"
          title={
            <div className="flex items-center space-x-2">
              <span>Upload New Document</span>
            </div>
          }
        >
          <Card className="bg-charyo-500/60 backdrop-blur-sm">
            <CardHeader className="flex flex-col items-start">
              <h3 className="text-lg font-semibold text-notpurple-500">Upload New Document</h3>
              <p className="text-small text-notpurple-500/60">Add new documents to your knowledge base</p>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <UploadForm
                  file={file}
                  setFile={setFile}
                  category={category}
                  setCategory={setCategory}
                  processing={processing}
                  status={status}
                  handleUpload={handleUpload}
                />
                <Guidelines />
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default EmbeddingsPage;
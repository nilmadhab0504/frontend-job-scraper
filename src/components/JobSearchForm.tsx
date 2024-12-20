import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import {
  Upload,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  FileEdit,
  Building,
  MapPin,
  GraduationCap,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  degree_requirements: string;
}

interface CoverLetters {
  [key: string]: string;
}

export function JobSearchForm() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [resume_text, setResume_text] = useState("");
  const [coverLetters, setCoverLetters] = useState<CoverLetters>({});
  const [generatingLetter, setGeneratingLetter] = useState<string | null>(null);
  const [copiedLetter, setCopiedLetter] = useState<string | null>(null);

  async function handleJobSearch() {
    if (!selectedFile) {
      setError("Please upload a resume");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        "http://localhost:4000/api/parse-and-search",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to parse resume");
      }

      const data = await response.json();
      console.log(data);
      setJobs(data.results || []);
      setResume_text(data.resume_text || "");
      setIsSubmitting(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setJobs([]);
      setIsSubmitting(false);
    }
  }

  async function handleGenerateCoverLetter(job: Job) {
    setGeneratingLetter(job.id);

    try {
      const response = await fetch(
        "http://localhost:4000/api/generate-cover-letter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume_text,
            description: job.description,
            company: job.company,
            position: job.title,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate cover letter");
      }
      console.log(response);
      const data = await response.json();
      console.log(data);
      setCoverLetters((prev) => ({
        ...prev,
        [job.id]: data.cover_letter,
      }));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate cover letter"
      );
    } finally {
      setGeneratingLetter(null);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverLetters({});
      setJobs([]);
      setSelectedFile(file);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setCoverLetters({});
    setJobs([]);
  };

  const toggleCard = (jobId: string) => {
    const newExpandedCards = new Set(expandedCards);
    if (expandedCards.has(jobId)) {
      newExpandedCards.delete(jobId);
    } else {
      newExpandedCards.add(jobId);
    }
    setExpandedCards(newExpandedCards);
  };

  const handleCopyCoverLetter = (jobId: string) => {
    const coverLetter = coverLetters[jobId];
    if (coverLetter) {
      navigator.clipboard
        .writeText(coverLetter)
        .then(() => {
          setCopiedLetter(jobId);
          toast({
            title: "Cover letter copied!",
            description: "The cover letter has been copied to your clipboard.",
          });
          setTimeout(() => setCopiedLetter(null), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          toast({
            title: "Failed to copy",
            description: "An error occurred while copying the cover letter.",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-4">
      <div className="flex flex-col w-full items-center gap-4">
        <Label htmlFor="resume" className="flex items-center gap-2">
          <Upload className="text-gray-500" size={20} />
          Resume Upload
        </Label>

        <div className="flex w-full max-w-md hidden items-center gap-2">
          <Input
            id="resume"
            type="file"
            name="resume"
            accept=".pdf,.doc,.docx"
            className="w-full"
            onChange={handleFileChange}
          />
        </div>

        {selectedFile && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText size={16} />
            <span>{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={handleFileRemove}
              className="text-red-500 hover:text-red-700"
            >
              <X size={20} />
            </Button>
          </div>
        )}

        <Button
          onClick={handleJobSearch}
          disabled={!selectedFile || isSubmitting}
          className="w-full max-w-xs"
        >
          {isSubmitting ? "Searching..." : "Find Matching Jobs"}
        </Button>
      </div>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {isSubmitting && (
        <div className="text-center">
          <p className="text-lg font-semibold">
            Searching for matching jobs...
          </p>
          {/* You can add a loading spinner here if desired */}
        </div>
      )}

      {jobs && jobs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Matching Jobs</h2>
          <div className="grid lg:grid-cols-1 gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{job.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCard(job.id)}
                      className="ml-2 -mt-1"
                    >
                      {expandedCards.has(job.id) ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Building size={16} />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin size={16} />
                    <span>{job.location}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                    {job.description}
                  </p>
                  {job.degree_requirements && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                      <GraduationCap size={16} />
                      <span>Required: {job.degree_requirements}</span>
                    </div>
                  )}

                  {expandedCards.has(job.id) && coverLetters[job.id] && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold mb-2">
                        Cover Letter
                      </h3>
                      <p className="text-sm whitespace-pre-wrap">
                        {coverLetters[job.id]}
                      </p>
                      <Button
                        onClick={() => handleCopyCoverLetter(job.id)}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        {copiedLetter === job.id ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Cover Letter
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleGenerateCoverLetter(job)}
                    disabled={generatingLetter === job.id}
                    className="w-full"
                    variant={coverLetters[job.id] ? "secondary" : "default"}
                  >
                    <FileEdit className="w-4 h-4 mr-2" />
                    {generatingLetter === job.id
                      ? "Generating..."
                      : coverLetters[job.id]
                      ? "Regenerate Cover Letter"
                      : "Generate Cover Letter"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {jobs && jobs.length === 0 && !isSubmitting && (
        <div className="text-center mt-8">
          <p className="text-lg font-semibold">No matching jobs found</p>
          <p className="text-gray-600 mt-2">
            Try uploading a different resume or adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  );
}

export default JobSearchForm;

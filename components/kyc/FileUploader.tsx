'use client';

import { useDropzone, FileRejection } from 'react-dropzone';
import { useCallback, useState, useEffect } from 'react';
import { UploadCloud, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { KYC_FILE_CONSTRAINTS } from '@/types/kyc';

interface FileUploaderProps {
    onFileSelect: (file: File | null) => void;
    accept?: Record<string, string[]>;
    maxSize?: number;
    label?: string;
    description?: string;
    error?: string;
    currentFile?: File | null;
}

export function FileUploader({
    onFileSelect,
    accept = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/webp': ['.webp'],
    },
    maxSize = KYC_FILE_CONSTRAINTS.MAX_FILE_SIZE, // 5MB default
    label = 'Upload File',
    description = 'Drag & drop or click to upload',
    error: paramsError,
    currentFile,
}: FileUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [internalError, setInternalError] = useState<string | null>(null);

    // cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            setInternalError(null);

            if (fileRejections.length > 0) {
                const rejection = fileRejections[0];
                if (rejection.errors[0].code === 'file-too-large') {
                    setInternalError(`File is too large. Max size is ${maxSize / 1024 / 1024}MB`);
                } else if (rejection.errors[0].code === 'file-invalid-type') {
                    setInternalError('Invalid file type. Only JPG, PNG, and WebP are allowed');
                } else {
                    setInternalError(rejection.errors[0].message);
                }
                return;
            }

            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                onFileSelect(file);

                // Create preview
                const objectUrl = URL.createObjectURL(file);
                setPreview(objectUrl);
            }
        },
        [maxSize, onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        multiple: false,
    });

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFileSelect(null);
        setPreview(null);
        setInternalError(null);
    };

    const errorMessage = paramsError || internalError;

    return (
        <div className="w-full space-y-2">
            <div
                {...getRootProps()}
                className={cn(
                    'relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ease-in-out cursor-pointer group',
                    isDragActive
                        ? 'border-primary bg-primary/5 scale-[1.01]'
                        : 'border-white/10 hover:border-primary/50 hover:bg-white/5',
                    errorMessage && 'border-red-500/50 bg-red-500/5',
                    currentFile && !errorMessage && 'border-green-500/50 bg-green-500/5'
                )}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    {preview ? (
                        <div className="relative w-full aspect-video max-w-[300px] rounded-lg overflow-hidden border border-white/10">
                            <Image
                                src={preview}
                                alt="Preview"
                                fill
                                className="object-cover"
                            />
                            <button
                                onClick={removeFile}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/90 text-white rounded-full transition-colors backdrop-blur-sm"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className={cn(
                            "p-4 rounded-full bg-white/5 text-white/40 transition-colors group-hover:text-primary group-hover:bg-primary/10",
                            errorMessage && "text-red-400 bg-red-400/10",
                            isDragActive && "text-primary bg-primary/10"
                        )}>
                            <UploadCloud className="w-8 h-8" />
                        </div>
                    )}

                    <div className="space-y-1">
                        <h3 className="font-medium text-foreground">
                            {currentFile ? currentFile.name : label}
                        </h3>
                        <p className="text-sm text-foreground/50">
                            {currentFile
                                ? `${(currentFile.size / 1024 / 1024).toFixed(2)} MB`
                                : description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="flex items-center gap-2 text-xs text-red-400 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Success Message */}
            {currentFile && !errorMessage && (
                <div className="flex items-center gap-2 text-xs text-green-400 animate-in fade-in slide-in-from-top-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ready to upload</span>
                </div>
            )}
        </div>
    );
}

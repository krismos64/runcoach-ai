import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Smartphone,
  Watch,
  RefreshCw,
  Play,
  Activity,
  Heart
} from 'lucide-react';

interface ImportFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  data?: {
    workouts: number;
    distance: number;
    duration: number;
    startDate: string;
    endDate: string;
  };
  error?: string;
}

interface DataSource {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  supported: boolean;
  fileTypes: string[];
}

const ImportData: React.FC = () => {
  const [files, setFiles] = useState<ImportFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('apple-health');

  const dataSources: DataSource[] = [
    {
      id: 'apple-health',
      name: 'Apple Health',
      icon: Smartphone,
      description: 'Importez vos données d\'entraînement depuis l\'app Santé d\'Apple',
      supported: true,
      fileTypes: ['xml', 'zip']
    },
    {
      id: 'garmin',
      name: 'Garmin Connect',
      icon: Watch,
      description: 'Synchronisez avec votre compte Garmin Connect',
      supported: true,
      fileTypes: ['fit', 'tcx', 'gpx']
    },
    {
      id: 'strava',
      name: 'Strava',
      icon: Activity,
      description: 'Importez vos activités depuis Strava',
      supported: true,
      fileTypes: ['gpx', 'tcx', 'fit']
    },
    {
      id: 'polar',
      name: 'Polar Flow',
      icon: Heart,
      description: 'Connectez votre compte Polar Flow',
      supported: false,
      fileTypes: ['tcx', 'gpx']
    }
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (selectedFiles: File[]) => {
    const newFiles: ImportFile[] = selectedFiles.map((file, index) => ({
      id: Date.now().toString() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
    processFiles(newFiles);
  };

  const processFiles = async (filesToProcess: ImportFile[]) => {
    setIsProcessing(true);

    for (const file of filesToProcess) {
      // Update file status to processing
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'processing', progress: 0 } : f
      ));

      // Simulate file processing with progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, progress } : f
        ));
      }

      // Simulate processing result
      const isSuccess = Math.random() > 0.2; // 80% success rate

      if (isSuccess) {
        const mockData = {
          workouts: Math.floor(Math.random() * 100) + 50,
          distance: Math.floor(Math.random() * 500) + 200,
          duration: Math.floor(Math.random() * 2000) + 1000,
          startDate: '2023-01-01',
          endDate: '2024-01-15'
        };

        setFiles(prev => prev.map(f =>
          f.id === file.id ? {
            ...f,
            status: 'success',
            progress: 100,
            data: mockData
          } : f
        ));
      } else {
        setFiles(prev => prev.map(f =>
          f.id === file.id ? {
            ...f,
            status: 'error',
            progress: 0,
            error: 'Erreur lors du traitement du fichier. Format non supporté.'
          } : f
        ));
      }
    }

    setIsProcessing(false);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const retryFile = (fileId: string) => {
    const fileToRetry = files.find(f => f.id === fileId);
    if (fileToRetry) {
      processFiles([fileToRetry]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const successfulFiles = files.filter(f => f.status === 'success');
  const totalWorkouts = successfulFiles.reduce((sum, f) => sum + (f.data?.workouts || 0), 0);
  const totalDistance = successfulFiles.reduce((sum, f) => sum + (f.data?.distance || 0), 0);

  return (
    <>
      <Helmet>
        <title>Importer des données | RunCoach AI</title>
        <meta name="description" content="Importez vos données d'entraînement depuis Apple Health, Garmin, Strava et autres sources compatibles" />
        <meta property="og:title" content="Import de données RunCoach AI" />
        <meta property="og:description" content="Synchronisez facilement vos données d'entraînement de course à pied" />
        <link rel="canonical" href="/import" />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Importer vos données
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Importez facilement vos données d'entraînement depuis vos appareils et applications préférées
          </p>
        </motion.div>

        {/* Data Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sources de données supportées</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dataSources.map((source) => {
              const Icon = source.icon;
              return (
                <button
                  key={source.id}
                  onClick={() => setSelectedSource(source.id)}
                  disabled={!source.supported}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedSource === source.id
                      ? 'border-blue-500 bg-blue-50'
                      : source.supported
                      ? 'border-gray-200 hover:border-gray-300 bg-white'
                      : 'border-gray-100 bg-gray-50 opacity-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedSource === source.id ? 'bg-blue-500' : 'bg-gray-200'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        selectedSource === source.id ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{source.name}</h4>
                      {!source.supported && (
                        <span className="text-xs text-orange-600 font-medium">Bientôt disponible</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{source.description}</p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Formats: {source.fileTypes.join(', ')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Apple Health Instructions */}
        {selectedSource === 'apple-health' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 rounded-2xl p-6 border border-blue-200"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Comment exporter vos données Apple Health</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Ouvrez l'app <strong>Santé</strong> sur votre iPhone</li>
                  <li>Appuyez sur votre photo de profil en haut à droite</li>
                  <li>Sélectionnez <strong>"Exporter toutes les données de santé"</strong></li>
                  <li>Attendez la génération du fichier (peut prendre quelques minutes)</li>
                  <li>Partagez le fichier vers cette page ou votre ordinateur</li>
                </ol>
                <div className="mt-4 flex items-center space-x-2">
                  <Download className="w-4 h-4 text-blue-600" />
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Guide détaillé avec captures d'écran
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* File Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/20"
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Glissez-déposez vos fichiers ici
              </h3>
              <p className="text-gray-600 mb-4">
                ou cliquez pour sélectionner des fichiers
              </p>

              <input
                type="file"
                multiple
                accept=".xml,.zip,.fit,.tcx,.gpx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span>Sélectionner des fichiers</span>
              </label>

              <p className="text-xs text-gray-500 mt-4">
                Formats supportés: XML, ZIP, FIT, TCX, GPX (max 100MB par fichier)
              </p>
            </div>
          </div>
        </motion.div>

        {/* File List */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Fichiers à traiter ({files.length})
                </h3>
                {isProcessing && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Traitement en cours...</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {getStatusIcon(file.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{file.name}</h4>
                          <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                        </div>

                        {file.status === 'processing' && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${file.progress}%` }}
                                className="bg-blue-600 h-2 rounded-full"
                              />
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{file.progress}% traité</p>
                          </div>
                        )}

                        {file.status === 'success' && file.data && (
                          <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Séances:</span>
                              <span className="font-medium ml-1">{file.data.workouts}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Distance:</span>
                              <span className="font-medium ml-1">{file.data.distance} km</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Période:</span>
                              <span className="font-medium ml-1">{file.data.startDate} - {file.data.endDate}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Temps:</span>
                              <span className="font-medium ml-1">{Math.floor(file.data.duration / 60)}h</span>
                            </div>
                          </div>
                        )}

                        {file.status === 'error' && (
                          <p className="text-sm text-red-600 mt-1">{file.error}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {file.status === 'error' && (
                        <button
                          onClick={() => retryFile(file.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Réessayer"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Import Summary */}
        <AnimatePresence>
          {successfulFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Import réussi !</h3>
                  <p className="text-green-100">Vos données ont été importées avec succès</p>
                </div>
                <CheckCircle className="w-12 h-12 text-white" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <div className="text-sm text-green-100 mb-1">Fichiers traités</div>
                  <div className="text-2xl font-bold">{successfulFiles.length}</div>
                </div>
                <div>
                  <div className="text-sm text-green-100 mb-1">Entraînements</div>
                  <div className="text-2xl font-bold">{totalWorkouts}</div>
                </div>
                <div>
                  <div className="text-sm text-green-100 mb-1">Distance totale</div>
                  <div className="text-2xl font-bold">{totalDistance} km</div>
                </div>
                <div>
                  <div className="text-sm text-green-100 mb-1">Période</div>
                  <div className="text-lg font-semibold">2023-2024</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-green-100">
                  Vos données sont maintenant disponibles dans votre tableau de bord
                </p>
                <button className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Voir le dashboard</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ImportData;
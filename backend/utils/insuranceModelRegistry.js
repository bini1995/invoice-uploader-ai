const insuranceModelRegistry = [
  {
    id: 'hf-claims-intel/insurance-claim-classifier',
    name: 'Claims Classifier XL',
    provider: 'Hugging Face',
    task: 'claim-triage',
    fineTunedOn: 'insurance claims adjudication datasets',
    version: '2025-11',
    status: 'active',
  },
  {
    id: 'hf-claims-intel/fnol-severity-detector',
    name: 'FNOL Severity Detector',
    provider: 'Hugging Face',
    task: 'severity-scoring',
    fineTunedOn: 'first notice of loss insurance records',
    version: '2025-09',
    status: 'active',
  },
  {
    id: 'hf-claims-intel/policy-exception-summarizer',
    name: 'Policy Exception Summarizer',
    provider: 'Hugging Face',
    task: 'exception-summarization',
    fineTunedOn: 'policy clauses + claims exception annotations',
    version: '2025-12',
    status: 'pilot',
  },
];

export default insuranceModelRegistry;

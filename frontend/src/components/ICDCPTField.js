import React, { useState } from 'react';

const icdRegex = /^[A-TV-Z][0-9][0-9A-Z](\.[0-9A-Z]{1,4})?$/;
const cptRegex = /^[0-9]{5}$/;

/**
 * Editable ICD and CPT code inputs with regex validation and controls to confirm
 * or override AI suggestions.
 *
 * @param {Object} props - Component props.
 * @param {string} [props.initialICD=''] - Initial ICD code value.
 * @param {string} [props.initialCPT=''] - Initial CPT code value.
 * @param {{icd?: string, cpt?: string}} [props.suggestion={}] - Suggested codes from AI.
 * @param {(update: {icd: string, cpt: string, confirmed: boolean}) => void} [props.onChange] - Callback when values or confirmation change.
 * @returns {JSX.Element}
 */
export default function ICDCPTField({ initialICD = '', initialCPT = '', suggestion = {}, onChange }) {
  const [icd, setICD] = useState(initialICD);
  const [cpt, setCPT] = useState(initialCPT);
  const [confirmed, setConfirmed] = useState(false);

  const validICD = !icd || icdRegex.test(icd);
  const validCPT = !cpt || cptRegex.test(cpt);

  const confirm = () => {
    setConfirmed(true);
    onChange && onChange({ icd, cpt, confirmed: true });
  };
  const override = () => {
    setConfirmed(false);
    onChange && onChange({ icd, cpt, confirmed: false });
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-medium">ICD Code</label>
        <input
          value={icd}
          onChange={(e) => setICD(e.target.value)}
          className={`input text-sm ${validICD ? '' : 'border-red-500'}`}
        />
        {!validICD && <p className="text-red-500 text-xs">Invalid ICD-10 code</p>}
      </div>
      <div>
        <label className="block text-xs font-medium">CPT Code</label>
        <input
          value={cpt}
          onChange={(e) => setCPT(e.target.value)}
          className={`input text-sm ${validCPT ? '' : 'border-red-500'}`}
        />
        {!validCPT && <p className="text-red-500 text-xs">Invalid CPT code</p>}
      </div>
      {(suggestion.icd || suggestion.cpt) && (
        <div className="flex gap-2">
          <button onClick={confirm} className="btn btn-primary text-xs" disabled={confirmed}>
            Confirm
          </button>
          <button onClick={override} className="btn btn-secondary text-xs">
            Override
          </button>
        </div>
      )}
    </div>
  );
}

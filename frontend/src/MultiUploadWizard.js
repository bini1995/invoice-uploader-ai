import React, { useState } from 'react';
import ImprovedMainLayout from './components/ImprovedMainLayout';
import TagEditor from './components/TagEditor';
import SuggestionChips from './components/SuggestionChips';
import { Button } from './components/ui/Button';
import ProgressBar from './components/ProgressBar';
import { CircularProgress } from '@mui/material';
import { API_BASE } from './api';

export default function MultiUploadWizard() {
  const token = localStorage.getItem('token') || '';
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]); // [{file, headers, rows, errors: [{index,messages,fields,summary}], tags:{}}]
  const [active, setActive] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateRow = async(row)=>{
    try{
      const res = await fetch(`${API_BASE}/api/validation/validate-row`,{
        method:'POST',
        headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
        body: JSON.stringify(row)
      });
      const data = await res.json();
      return Array.isArray(data.errors)?data.errors:[];
    }catch(e){
      console.error('validate error',e);
      return [];
    }
  };

  const parseFiles = async(fileList)=>{
    const arr = Array.from(fileList);
    const parsed = [];
    for(const file of arr){
      const text = await file.text();
      const lines = text.trim().split(/\r?\n/);
      const headers = lines[0].split(',').map(h=>h.trim());
      const rows = lines.slice(1).map(l=>{
        const vals = l.split(',');
        const obj={};
        headers.forEach((h,i)=>{obj[h]=vals[i]||'';});
        return obj;
      });
      const rowErrors=[];
      for(const [i,row] of rows.entries()){
        const errs = await validateRow(row);
        const messages = errs.map(e=>e.message);
        const fields = {};
        errs.forEach(e=>{if(e.field) fields[e.field]=e.message;});
        let summary='';
        if(messages.length){
          try{
            const res = await fetch(`${API_BASE}/api/claims/summarize-errors`,{
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ errors: messages })
            });
            const data = await res.json();
            summary=data.summary;
          }catch(e){
            summary='AI summary failed';
          }
        }
        if(messages.length){
          rowErrors.push({index:i,messages:messages,fields,summary});
        }
      }
      parsed.push({file,headers,rows,errors:rowErrors,tags:{}});
    }
    setFiles(parsed);
  };

  const handleCellChange = async(fi, ri, field, val)=>{
    setFiles(prev=>prev.map((f,idx)=>idx!==fi?f:{...f,rows:f.rows.map((r,i)=>i===ri?{...r,[field]:val}:r)}));
    const row = {...files[fi].rows[ri], [field]: val};
    const errs = await validateRow(row);
    const messages = errs.map(e=>e.message);
    const fields={};
    errs.forEach(e=>{if(e.field) fields[e.field]=e.message;});
    setFiles(prev=>prev.map((f,idx)=>{
      if(idx!==fi) return f;
      const others = f.errors.filter(e=>e.index!==ri);
      if(messages.length) others.push({index:ri,messages,fields,summary:f.errors.find(e=>e.index===ri)?.summary||''});
      return {...f,errors:others};
    }));
  };

  const handleUpload = async()=>{
    setUploading(true);
    let processed = 0;
    for(const f of files){
      const csv=[f.headers.join(',')].concat(f.rows.map(r=>f.headers.map(h=>r[h]).join(','))).join('\n');
      const blob=new Blob([csv],{type:'text/csv'});
      const formData=new FormData();
      formData.append('invoiceFile',blob,f.file.name);
      try{
        await fetch(`${API_BASE}/api/claims/upload`,{
          method:'POST',
          headers:{Authorization:`Bearer ${token}`},
          body:formData
        });
      }catch(e){
        console.error('Upload failed',e);
      }
      processed++;
      setUploadProgress(Math.round((processed/ files.length)*100));
    }
    setUploading(false);
  };

  return (
    <ImprovedMainLayout title="Upload Wizard">
      <div className="max-w-3xl mx-auto space-y-6">
        {step===1 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">1. Upload Files</h2>
            <input type="file" accept=".csv" multiple onChange={e=>parseFiles(e.target.files)}/>
            {files.length>0 && <Button onClick={()=>setStep(2)}>Next</Button>}
          </div>
        )}

        {step===2 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">2. Preview</h2>
            <div className="flex gap-2 mb-2">
              {files.map((f,i)=>(
                <button key={i} onClick={()=>setActive(i)} className={`px-2 py-1 rounded text-xs ${i===active?'bg-indigo-600 text-white':'bg-gray-200'}`}>{f.file.name}</button>
              ))}
            </div>
            {files[active] && (
              <div className="overflow-x-auto max-h-60 border rounded">
                <table className="table-auto text-xs w-full table-striped table-hover">
                  <thead>
                    <tr>
                      {files[active].headers.map(h => (
                        <th key={h} className="px-1 py-0.5 text-left border-b">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {files[active].rows.slice(0,5).map((r,i)=>(
                      <tr key={i} className="hover:bg-gray-50">
                        {files[active].headers.map(h => (
                          <td key={h} className="px-1 py-0.5 border-b">{r[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Button onClick={()=>setStep(3)}>Next</Button>
          </div>
        )}

        {step===3 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">3. Fix Errors</h2>
            {files.map((f,fi)=>(
              <div key={fi} className="mb-4">
                <div className="font-medium text-sm mb-1">{f.file.name}</div>
                <table className="table-auto text-xs w-full mb-2 table-striped table-hover">
                  <thead>
                    <tr>{f.headers.map(h=>(<th key={h} className="border px-1 py-0.5 text-left">{h}</th>))}<th className="border px-1 py-0.5">AI Hint</th></tr>
                  </thead>
                  <tbody>
                    {f.rows.map((row,ri)=>{
                      const errObj = f.errors.find(e=>e.index===ri);
                      return (
                      <tr key={ri} className={errObj?'bg-red-50':''}>
                        {f.headers.map(h=>(
                          <td key={h} className={`border px-1 py-0.5 ${errObj?.fields?.[h]?'bg-red-100':''}`}>
                            <input className="input text-xs w-full" value={row[h]} onChange={e=>handleCellChange(fi,ri,h,e.target.value)} />
                            {errObj?.fields?.[h] && (<div className="text-red-500 text-[10px]">{errObj.fields[h]}</div>)}
                          </td>
                        ))}
                        <td className="border px-1 py-0.5 text-xs w-48">
                          {f.errors.find(e=>e.index===ri)?.summary || ''}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
            <Button onClick={()=>setStep(4)}>Next</Button>
          </div>
        )}

        {step===4 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">4. Confirm Tags</h2>
            {files.map((f,fi)=>(
              <div key={fi} className="border p-2 rounded mb-2">
                <div className="font-medium text-sm">{f.file.name}</div>
                {f.rows.map((row,ri)=>(
                  <div key={ri} className="border p-2 mb-1">
                    <div className="text-xs mb-1">Row {ri+1}</div>
                    <TagEditor tags={row.tags||[]} onAddTag={t=>setFiles(prev=>prev.map((f2,idx)=>idx!==fi?f2:{...f2,rows:f2.rows.map((r,i)=>i===ri?{...r,tags:[...(r.tags||[]),t]}:r)}))} onRemoveTag={t=>setFiles(prev=>prev.map((f2,idx)=>idx!==fi?f2:{...f2,rows:f2.rows.map((r,i)=>i===ri?{...r,tags:(r.tags||[]).filter(x=>x!==t)}:r)}))} />
                    <SuggestionChips suggestions={[]} onClick={()=>{}} />
                  </div>
                ))}
              </div>
            ))}
            <Button onClick={()=>setStep(5)}>Next</Button>
          </div>
        )}

        {step===5 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
            <h2 className="text-lg font-semibold">5. Submit</h2>
            {uploading && (<div className="flex flex-col items-center space-y-2"><CircularProgress size={24} /><ProgressBar value={uploadProgress} /></div>)}
            <Button onClick={handleUpload} disabled={uploading}>{uploading?'Uploading...':'Upload'}</Button>
          </div>
        )}
      </div>
    </ImprovedMainLayout>
  );
}

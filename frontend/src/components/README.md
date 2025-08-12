# Components

This directory houses reusable UI components. Below are examples for newly added healthcare review helpers.

## DocumentViewer
Displays claim data alongside AI findings for each section.

```jsx
import DocumentViewer from './DocumentViewer';

<DocumentViewer
  sections={[{ id: 'header', title: 'Header' }]}
  claim={{ header: { /* claim fields */ } }}
  findings={{ header: { /* ai output */ } }}
/>
```

## ICDCPTField
Editable ICD/CPT inputs with validation and ability to confirm or override AI suggestions.

```jsx
import ICDCPTField from './ICDCPTField';

<ICDCPTField
  suggestion={{ icd: 'A00', cpt: '12345' }}
  onChange={(data) => console.log(data)}
/>
```

## CommentThread
Threaded comments for a claim with optimistic posting.

```jsx
import CommentThread from './CommentThread';

<CommentThread claimId={claimId} token={authToken} />
```

## FlaggedCodeChat
Small toggle that opens a chat tied to a flagged code.

```jsx
import FlaggedCodeChat from './FlaggedCodeChat';

<FlaggedCodeChat code="A00" />
```

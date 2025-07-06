# Firebase Integration for DSA Tracker

This document explains how Firebase is integrated into the DSA Tracker application for storing and managing problem data.

## Overview

The application uses Firebase Firestore to store problem data with the following features:
- **User-specific data**: Each user has their own collection of problems
- **Real-time updates**: Data syncs across devices in real-time
- **CRUD operations**: Create, Read, Update, Delete problems
- **Authentication**: Problems are tied to authenticated users

## Firebase Setup

### Configuration
The Firebase configuration is in `lib/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyB-VocZjQrJjxjKWhJs79KPehqDgPGt2Ts",
  authDomain: "dsa-tracker-417df.firebaseapp.com",
  projectId: "dsa-tracker-417df",
  storageBucket: "dsa-tracker-417df.appspot.com",
  messagingSenderId: "805745890",
  appId: "1:805745890:web:cc213d6a0e904a438fdabb",
  measurementId: "G-81007HHVEW"
};
```

### Data Structure

#### Problem Document
Each problem is stored as a document in the `problems` collection:

```typescript
interface Problem {
  id?: string;           // Firestore document ID
  title: string;         // Problem title
  link: string;          // LeetCode/Problem URL
  topic: string;         // Problem topic/category
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Solved' | 'Unsolved' | 'Attempted';
  similarQuestions?: string;
  userId: string;        // User ID (for security)
  createdAt?: any;       // Firestore timestamp
  updatedAt?: any;       // Firestore timestamp
}
```

#### Collection Structure
```
problems/
├── {problemId1}/
│   ├── title: "Two Sum"
│   ├── link: "https://leetcode.com/problems/two-sum/"
│   ├── topic: "Array, Hash Table"
│   ├── difficulty: "Easy"
│   ├── status: "Solved"
│   ├── userId: "user123"
│   ├── createdAt: Timestamp
│   └── updatedAt: Timestamp
├── {problemId2}/
│   └── ...
```

## Firebase Service Functions

### `problemService` Object

Located in `lib/firebase.ts`, provides all CRUD operations:

#### 1. Get Problems (Real-time)
```typescript
getProblems: (userId: string, callback: (problems: Problem[]) => void)
```
- Returns a real-time listener for all problems belonging to a user
- Automatically updates when data changes
- Orders by creation date (newest first)

#### 2. Add Problem
```typescript
addProblem: async (problem: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>)
```
- Creates a new problem document
- Automatically adds timestamps
- Returns the new document ID

#### 3. Update Problem
```typescript
updateProblem: async (problemId: string, updates: Partial<Problem>)
```
- Updates specific fields of a problem
- Automatically updates the `updatedAt` timestamp

#### 4. Delete Problem
```typescript
deleteProblem: async (problemId: string)
```
- Permanently deletes a problem document

#### 5. Filtered Problems
```typescript
getFilteredProblems: async (userId: string, filters: {
  topic?: string;
  difficulty?: Difficulty | 'All';
  status?: Status | 'All';
})
```
- Returns problems matching specific filters
- Useful for server-side filtering

## Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own problems
    match /problems/{problemId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### Key Security Features
1. **Authentication Required**: Users must be logged in
2. **User Isolation**: Users can only access their own problems
3. **Data Validation**: Server-side validation of problem data

## Frontend Integration

### Custom Hook: `useProblems`
Located in `lib/hooks/useProblems.ts`, provides a clean interface:

```typescript
const { problems, loading, error, addProblem, updateProblem, deleteProblem } = useProblems();
```

#### Features:
- **Automatic Authentication**: Handles auth state changes
- **Real-time Updates**: Automatically syncs data changes
- **Error Handling**: Provides error states and messages
- **Loading States**: Shows loading indicators

### Usage in Components

#### Problems Page (`app/problems/page.tsx`)
```typescript
// State management
const [problems, setProblems] = useState<Problem[]>([]);
const [loading, setLoading] = useState(true);
const [userId, setUserId] = useState<string | null>(null);

// Real-time data listening
useEffect(() => {
  if (!userId) return;
  
  const unsubscribe = problemService.getProblems(userId, (problems) => {
    setProblems(problems);
  });
  
  return () => unsubscribe();
}, [userId]);

// CRUD operations
const handleAddProblem = async () => {
  await problemService.addProblem({
    ...newProblem,
    userId,
    similarQuestions: 'AISimilar'
  });
};

const handleDeleteProblem = async (id: string) => {
  await problemService.deleteProblem(id);
};
```

## Data Flow

1. **User Authentication**: User logs in → `userId` is set
2. **Data Loading**: Real-time listener starts → Problems load from Firestore
3. **User Actions**: Add/Edit/Delete → Firebase operations → Real-time updates
4. **UI Updates**: Component re-renders with new data

## Performance Considerations

### Frontend Filtering vs Backend Filtering
- **Frontend Filtering**: Used for search, sorting, and quick filters
- **Backend Filtering**: Available for complex queries and pagination

### Real-time Listeners
- **Automatic Cleanup**: Listeners are properly cleaned up on component unmount
- **Efficient Queries**: Only fetches user-specific data
- **Optimistic Updates**: UI updates immediately, syncs with server

## Error Handling

### Common Error Scenarios
1. **Network Issues**: Automatic retry with user feedback
2. **Authentication Errors**: Redirect to login
3. **Permission Errors**: Show access denied message
4. **Validation Errors**: Form validation with helpful messages

### Error Recovery
- **Graceful Degradation**: App continues to work with cached data
- **User Feedback**: Clear error messages and loading states
- **Retry Mechanisms**: Automatic retry for transient failures

## Future Enhancements

### Planned Features
1. **Offline Support**: Cache problems for offline access
2. **Bulk Operations**: Import/export problem lists
3. **Advanced Filtering**: Server-side filtering for large datasets
4. **Data Analytics**: Track solving patterns and progress
5. **Collaboration**: Share problem lists with other users

### Scalability Considerations
1. **Pagination**: For users with many problems
2. **Indexing**: Optimize queries for common filters
3. **Caching**: Implement client-side caching strategies
4. **Compression**: Reduce data transfer for mobile users

## Testing

### Firebase Emulator
For local development and testing:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Start emulator
firebase emulators:start
```

### Test Data
Sample problems for testing:
```typescript
const sampleProblems = [
  {
    title: "Two Sum",
    link: "https://leetcode.com/problems/two-sum/",
    topic: "Array, Hash Table",
    difficulty: "Easy",
    status: "Solved",
    userId: "test-user"
  }
];
```

## Troubleshooting

### Common Issues
1. **Authentication Errors**: Check Firebase Auth configuration
2. **Permission Denied**: Verify Firestore security rules
3. **Real-time Updates Not Working**: Check listener cleanup
4. **Data Not Loading**: Verify user authentication state

### Debug Tools
- Firebase Console: Monitor data and authentication
- Browser DevTools: Check network requests and errors
- React DevTools: Inspect component state and props 
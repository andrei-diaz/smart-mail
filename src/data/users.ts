export interface User {
    id: string;
    name: string;
    role: 'Student' | 'Employee' | 'Resident';
}

export const MOCK_USERS: User[] = [
    { id: '1', name: 'Andrei Diaz', role: 'Student' },
    { id: '2', name: 'Maria Rodriguez', role: 'Employee' },
    { id: '3', name: 'Juan Perez', role: 'Resident' },
    { id: '4', name: 'Ana Garcia', role: 'Student' },
    { id: '5', name: 'Carlos Lopez', role: 'Employee' },
    { id: '6', name: 'Sofia Martinez', role: 'Resident' },
    { id: '7', name: 'Miguel Angel', role: 'Student' },
    { id: '8', name: 'Laura Torres', role: 'Employee' },
    { id: '9', name: 'Pedro Sanchez', role: 'Resident' },
    { id: '10', name: 'Elena Ramirez', role: 'Student' }
];

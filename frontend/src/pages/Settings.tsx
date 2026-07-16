import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function Settings() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">
            Settings page coming soon. You can add your preferences here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationCenterScreen } from './NotificationCenterScreen';
import { NotificationSettingsScreen } from './NotificationSettingsScreen';

export const NotificationDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('center');

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Components Demo</h1>
        <p className="text-muted-foreground">
          Interactive demo of the refactored notification components
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="center">Notification Center</TabsTrigger>
          <TabsTrigger value="settings">Notification Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="center" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Center</CardTitle>
              <p className="text-sm text-muted-foreground">
                Card list with icons per category and swipe-to-dismiss functionality
              </p>
            </CardHeader>
            <CardContent>
              <NotificationCenterScreen />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Toggles grouped with section headers (Training, Nutrition, Social)
              </p>
            </CardHeader>
            <CardContent>
              <NotificationSettingsScreen />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Overview */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Center Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="text-sm space-y-1">
              <li>• Card list organized by notification categories</li>
              <li>• Icons for each category with color coding</li>
              <li>• Swipe left to dismiss notifications</li>
              <li>• Grouped by type (Training, Health, Social, etc.)</li>
              <li>• Unread indicators and timestamps</li>
              <li>• Mark all as read functionality</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Settings Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="text-sm space-y-1">
              <li>• Toggles grouped by section headers</li>
              <li>• Training & Recovery settings</li>
              <li>• Nutrition & Wellness controls</li>
              <li>• Social & Community preferences</li>
              <li>• Global notification controls</li>
              <li>• Delivery method preferences</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
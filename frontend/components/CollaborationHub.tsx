'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Users, MessageSquare, GitBranch, Share2, Bell, Plus, Search } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'online' | 'away' | 'offline';
  currentProject: string;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  type: 'commit' | 'comment' | 'mention' | 'review';
}

export default function CollaborationHub() {
  const [members, setMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Alice Johnson', avatar: 'AJ', role: 'Lead Developer', status: 'online', currentProject: 'API Gateway' },
    { id: '2', name: 'Bob Smith', avatar: 'BS', role: 'Frontend Dev', status: 'online', currentProject: 'Dashboard' },
    { id: '3', name: 'Carol Davis', avatar: 'CD', role: 'DevOps Engineer', status: 'away', currentProject: 'CI/CD Pipeline' },
    { id: '4', name: 'David Wilson', avatar: 'DW', role: 'Backend Dev', status: 'offline', currentProject: 'Auth Service' }
  ]);

  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', user: 'Alice Johnson', action: 'Pushed to main branch', timestamp: new Date(), type: 'commit' },
    { id: '2', user: 'Bob Smith', action: 'Commented on PR #123', timestamp: new Date(Date.now() - 300000), type: 'comment' },
    { id: '3', user: 'Carol Davis', action: 'Mentioned you in #deployment', timestamp: new Date(Date.now() - 600000), type: 'mention' },
    { id: '4', user: 'David Wilson', action: 'Requested code review', timestamp: new Date(Date.now() - 900000), type: 'review' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'commit': return <GitBranch className="w-4 h-4" />;
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      case 'mention': return <Bell className="w-4 h-4" />;
      case 'review': return <Share2 className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users />
          Collaboration Hub
        </h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Team Members */}
        <div className="border rounded-lg bg-background p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Team Members</h2>
            <span className="text-sm text-muted-foreground">{members.length} online</span>
          </div>
          <div className="space-y-3">
            {members.map(member => (
              <div key={member.id} className="flex items-center gap-3 p-2 rounded hover:bg-accent/50 cursor-pointer">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {member.avatar}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                  <p className="text-xs text-muted-foreground">{member.currentProject}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="col-span-2 border rounded-lg bg-background p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Activity Feed</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64"
                />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded hover:bg-accent/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                  {activity.user[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getActivityIcon(activity.type)}
                    <span className="font-medium text-sm">{activity.user}</span>
                    <span className="text-sm text-muted-foreground">{activity.action}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.timestamp.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        <Button variant="outline" className="h-20 flex-col gap-2">
          <MessageSquare className="w-6 h-6" />
          <span className="text-sm">Start Discussion</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <GitBranch className="w-6 h-6" />
          <span className="text-sm">Create Branch</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <Share2 className="w-6 h-6" />
          <span className="text-sm">Share Project</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <Bell className="w-6 h-6" />
          <span className="text-sm">Notifications</span>
        </Button>
      </div>

      {/* Active Projects */}
      <div className="border rounded-lg bg-background p-4">
        <h2 className="font-semibold mb-4">Active Collaborations</h2>
        <div className="grid grid-cols-3 gap-4">
          {['API Gateway', 'Dashboard', 'Auth Service', 'CI/CD Pipeline'].map((project, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{project}</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-background" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">3 contributors</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${Math.random() * 60 + 40}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

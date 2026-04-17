import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useBackendActor";
import { AttendanceStatus } from "@/types";
import type {
  Assignment,
  AttendanceRecord,
  ClassTest,
  Student,
  TestResult,
} from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle,
  LogIn,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";

function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-sm px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display font-bold text-xl text-foreground mb-2">
          Parent Portal
        </h2>
        <p className="font-body text-sm text-muted-foreground mb-6">
          Sign in to monitor your child's attendance, assignments, and academic
          progress.
        </p>
        <Button
          onClick={() => login()}
          disabled={loginStatus === "logging-in"}
          data-ocid="parent.login_button"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold w-full"
        >
          <LogIn className="w-4 h-4 mr-2" />
          {loginStatus === "logging-in" ? "Signing in..." : "Parent Sign In"}
        </Button>
      </div>
    </div>
  );
}

export function ParentPortalPage() {
  const { loginStatus, identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const isLoggedIn =
    (loginStatus === "success" || loginStatus === "idle") && !!identity;
  const [tab, setTab] = useState("overview");

  // Parent can view their child profile (same account as student for now)
  const { data: profile } = useQuery({
    queryKey: ["parent-profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });

  const { data: attendance = [], isLoading: attLoading } = useQuery({
    queryKey: ["parent-attendance"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyAttendance();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });

  const { data: testResults = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["parent-test-results"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTestResults();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });

  const { data: tests = [] } = useQuery({
    queryKey: ["parent-tests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTests();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });

  const { data: assignments = [], isLoading: assignLoading } = useQuery({
    queryKey: ["parent-assignments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAssignments();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });

  if (!isLoggedIn) return <LoginPrompt />;

  const attendanceArr = attendance as AttendanceRecord[];
  const present = attendanceArr.filter(
    (r) => r.status === AttendanceStatus.present,
  ).length;
  const total = attendanceArr.length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  const testMap = new Map(
    (tests as ClassTest[]).map((t) => [t.id.toString(), t]),
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-foreground">
          Parent Portal
        </h1>
        {profile && (
          <p className="font-body text-sm text-muted-foreground mt-0.5">
            Monitoring:{" "}
            <strong className="text-foreground">
              {(profile as Student).name}
            </strong>
          </p>
        )}
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Attendance",
            value: `${pct}%`,
            icon: CheckCircle,
            color: "text-primary",
          },
          {
            label: "Present Days",
            value: present.toString(),
            icon: CheckCircle,
            color: "text-primary",
          },
          {
            label: "Absent Days",
            value: (total - present).toString(),
            icon: XCircle,
            color: "text-destructive",
          },
          {
            label: "Tests Taken",
            value: (testResults as TestResult[]).length.toString(),
            icon: TrendingUp,
            color: "text-accent",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <p className="font-display font-bold text-xl text-foreground">
                {stat.value}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList
          className="w-full mb-5 grid grid-cols-3"
          data-ocid="parent.tabs"
        >
          <TabsTrigger value="overview" data-ocid="parent.overview_tab">
            Overview
          </TabsTrigger>
          <TabsTrigger value="results" data-ocid="parent.results_tab">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            Results
          </TabsTrigger>
          <TabsTrigger value="assignments" data-ocid="parent.assignments_tab">
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-display font-semibold text-sm text-foreground">
                Recent Attendance
              </h3>
              {attLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <div className="space-y-2">
                  {attendanceArr.slice(0, 7).map((r, i) => (
                    <div
                      key={r.id.toString()}
                      className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
                      data-ocid={`parent.attendance.item.${i + 1}`}
                    >
                      <span className="font-body text-sm text-foreground">
                        {r.date}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${r.status === AttendanceStatus.present ? "text-primary border-primary/30" : "text-destructive border-destructive/30"}`}
                      >
                        {r.status}
                      </Badge>
                    </div>
                  ))}
                  {attendanceArr.length === 0 && (
                    <p
                      className="text-center py-4 font-body text-sm text-muted-foreground"
                      data-ocid="parent.attendance.empty_state"
                    >
                      No attendance records yet.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <div className="space-y-3">
            {resultsLoading ? (
              <Skeleton
                className="h-48 w-full"
                data-ocid="parent.results.loading_state"
              />
            ) : (testResults as TestResult[]).length === 0 ? (
              <div
                className="text-center py-10 text-muted-foreground font-body text-sm"
                data-ocid="parent.results.empty_state"
              >
                No test results yet.
              </div>
            ) : (
              (testResults as TestResult[]).map((r, i) => {
                const test = testMap.get(r.testId.toString());
                const pctScore = test
                  ? Math.round(
                      (Number(r.marksObtained) / Number(test.totalMarks)) * 100,
                    )
                  : 0;
                return (
                  <Card
                    key={r.id.toString()}
                    data-ocid={`parent.results.item.${i + 1}`}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-display font-semibold text-sm text-foreground">
                          {test?.name ?? "Test"}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          {test?.subject}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-lg text-primary">
                          {pctScore}%
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          {r.marksObtained.toString()}/
                          {test?.totalMarks?.toString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <div className="space-y-3">
            {assignLoading ? (
              <Skeleton
                className="h-48 w-full"
                data-ocid="parent.assignments.loading_state"
              />
            ) : (assignments as Assignment[]).length === 0 ? (
              <div
                className="text-center py-10 text-muted-foreground font-body text-sm"
                data-ocid="parent.assignments.empty_state"
              >
                No assignments yet.
              </div>
            ) : (
              (assignments as Assignment[]).map((a, i) => (
                <Card
                  key={a.id.toString()}
                  data-ocid={`parent.assignments.item.${i + 1}`}
                >
                  <CardContent className="p-4">
                    <p className="font-display font-semibold text-sm text-foreground">
                      {a.title}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {a.subject}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      Due:{" "}
                      {new Date(
                        Number(a.deadline / 1_000_000n),
                      ).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

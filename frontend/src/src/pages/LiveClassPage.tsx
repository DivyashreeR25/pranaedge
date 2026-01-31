import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ChatBot } from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/utils";
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  Play, 
  Plus, 
  Search, 
  MessageCircle, 
  UserPlus, 
  UserMinus,
  BookOpen,
  Settings,
  Send
} from "lucide-react";

interface Course {
  _id: string;
  course_name: string;
  instructor: string;
  description: string;
  duration: string;
  level: string;
  schedule: string;
  max_participants: number;
  price?: number;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

interface Enrollment {
  course_name: string;
  enrolled_users: string[];
  total_enrollments: number;
}

interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  course_name?: string;
}

interface ChatMessage {
  _id?: string;
  username: string;
  message: string;
  timestamp: string;
  course_name: string;
}

export default function LiveClassPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("available");
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);

  // Form state for creating course
  const [courseForm, setCourseForm] = useState({
    course_name: "",
    instructor: "",
    description: "",
    duration: "",
    level: "Beginner",
    days: [] as string[],
    time: "",
    endTime: "",
    timezone: "IST",
    max_participants: 20
  });

  useEffect(() => {
    if (activeTab === "available") {
      fetchCourses();
    } else if (activeTab === "my-courses") {
      fetchMyCourses();
    }
  }, [activeTab]);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchCourses();
        await fetchMyCourses();
      } catch (error) {
        console.error("Failed to initialize:", error);
      }
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course =>
        course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchQuery, courses]);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (!token) {
      console.error("No authentication token found!");
      toast({
        title: "Authentication Error",
        description: "Please log in to access your courses",
        variant: "destructive",
      });
    }
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch("http://localhost:5000/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
        setFilteredCourses(data.courses || []);
      } else {
        console.error("Failed to fetch courses:", response.status, response.statusText);
        toast({
          title: "Error",
          description: "Failed to fetch courses",
          variant: "destructive",
        });
        // Set empty arrays to prevent crashes
        setCourses([]);
        setFilteredCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
      // Set empty arrays to prevent crashes
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyCourses = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch("http://localhost:5000/my-courses");
      if (response.ok) {
        const data = await response.json();
        // Fix: Backend returns 'enrolled_courses' not 'courses'
        setMyCourses(data.enrolled_courses || []);
      } else {
        console.error("Failed to fetch my courses:", response.status, response.statusText);
        toast({
          title: "Error",
          description: "Failed to fetch your courses",
          variant: "destructive",
        });
        // Set empty array to prevent crashes
        setMyCourses([]);
      }
    } catch (error) {
      console.error("Error fetching my courses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your courses",
        variant: "destructive",
      });
      // Set empty array to prevent crashes
      setMyCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createCourse = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      if (!courseForm.course_name.trim()) {
        toast({
          title: "Validation Error",
          description: "Course name is required",
          variant: "destructive",
        });
        return;
        
      }
      
      if (!courseForm.instructor.trim()) {
        toast({
          title: "Validation Error",
          description: "Instructor name is required",
          variant: "destructive",
        });
        return;
      }
      
      if (!courseForm.description.trim()) {
        toast({
          title: "Validation Error",
          description: "Course description is required",
          variant: "destructive",
        });
        return;
      }
      
      if (courseForm.days.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please select at least one day",
          variant: "destructive",
        });
        return;
      }
      
      if (!courseForm.time) {
        toast({
          title: "Validation Error",
          description: "Course start time is required",
          variant: "destructive",
        });
        return;
      }

      if (!courseForm.endTime) {
        toast({
          title: "Validation Error",
          description: "Course end time is required",
          variant: "destructive",
        });
        return;
      }

      // Validate that end time is after start time
      if (courseForm.time >= courseForm.endTime) {
        toast({
          title: "Validation Error",
          description: "End time must be after start time",
          variant: "destructive",
        });
        return;
      }

      // Convert 24-hour time to 12-hour AM/PM format (matching Postman exactly)
      const formatTime = (time24: string) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        // Remove minutes if they're "00" and no space before AM/PM
        return minutes === "00" ? `${hour12} ${ampm}` : `${hour12}:${minutes} ${ampm}`;
      };

      // Prepare course data exactly as backend expects
      const courseData = {
        course_name: courseForm.course_name.trim(),
        instructor: courseForm.instructor.trim(),
        description: courseForm.description.trim(),
        duration: `${courseForm.duration.trim()} weeks`,
        level: courseForm.level,
        schedule: `${courseForm.days.map(d => d.slice(0,3)).join('-')}, ${formatTime(courseForm.time)} - ${formatTime(courseForm.endTime)}`,
        max_participants: courseForm.max_participants
      };
      
      console.log("Sending course data:", courseData);


      const response = await apiFetch("http://127.0.0.1:5000/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: `Course "${courseForm.course_name}" created successfully!`,
        });
        setShowCreateDialog(false);
        setCourseForm({
          course_name: "",
          instructor: "",
          description: "",
          duration: "",
          level: "Beginner",
          days: [],
          time: "",
          endTime: "",
          timezone: "IST",
          max_participants: 20
        });
        fetchCourses();
      } else {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        toast({
          title: "Error",
          description: errorData.message || `Failed to create course (${response.status})`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinCourse = async (courseName: string) => {
    try {
      setIsLoading(true);
      const response = await apiFetch(`http://localhost:5000/courses/${courseName}/join`, {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Successfully joined "${courseName}"!`,
        });
        fetchCourses();
        fetchMyCourses();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to join course",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error joining course:", error);
      toast({
        title: "Error",
        description: "Failed to join course",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const leaveCourse = async (courseName: string) => {
    try {
      setIsLoading(true);
      const response = await apiFetch(`http://localhost:5000/courses/${courseName}/leave`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Successfully left "${courseName}"!`,
        });
        fetchMyCourses();
        fetchCourses();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to leave course",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error leaving course:", error);
      toast({
        title: "Error",
        description: "Failed to leave course",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (courseName: string) => {
    try {
      setIsLoading(true);
      const response = await apiFetch(`http://127.0.0.1:5000/courses/${courseName}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Course "${courseName}" has been deleted successfully!`,
        });
        
        // Close group chat if it's open for this course
        if (selectedCourse?.course_name === courseName) {
          setShowGroupDialog(false);
          setSelectedCourse(null);
          setEnrollment(null);
          setMessages([]);
        }
        
        // Refresh data
        fetchMyCourses();
        fetchCourses();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to delete course",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openGroupChat = async (course: Course) => {
    setSelectedCourse(course);
    try {
      // First fetch course enrollments
      const enrollmentResponse = await apiFetch(`http://localhost:5000/courses/${course.course_name}/enrollments`);
      if (enrollmentResponse.ok) {
        const enrollmentData = await enrollmentResponse.json();
        setEnrollment(enrollmentData);
        
        // Then fetch chat messages
        await fetchChatMessages(course.course_name);
        
        setShowGroupDialog(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch course enrollments",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch course enrollments",
        variant: "destructive",
      });
    }
  };

  const fetchChatMessages = async (courseName: string) => {
    try {
      setIsChatLoading(true);
      const response = await apiFetch(`http://127.0.0.1:5000/courses/${courseName}/chat`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.messages && Array.isArray(data.messages)) {
          // Convert backend message format to frontend format
          const formattedMessages = data.messages.map((msg: ChatMessage) => ({
            id: msg._id || Date.now().toString(),
            username: msg.username,
            message: msg.message,
            timestamp: msg.timestamp,
            course_name: msg.course_name
          }));
          setMessages(formattedMessages);
        } else {
          // If no messages, show welcome message
          setMessages([
            {
              id: "1",
              username: "System",
              message: `Welcome to ${courseName} group chat! Start the conversation!`,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } else {
        console.error("Failed to fetch chat messages:", response.status);
        // Show welcome message on error
        setMessages([
          {
            id: "1",
            username: "System",
            message: `Welcome to ${courseName} group chat!`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      // Show welcome message on error
      setMessages([
        {
          id: "1",
          username: "System",
          message: `Welcome to ${courseName} group chat!`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() && user && selectedCourse) {
      try {
        setIsSendingMessage(true);
        
        // Create message object for backend
        const messageData = {
          username: user.username,
          message: newMessage.trim(),
          course_name: selectedCourse.course_name,
          timestamp: new Date().toISOString()
        };

        // Send message to backend
        const response = await apiFetch(`http://127.0.0.1:5000/courses/${selectedCourse.course_name}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messageData),
        });

        if (response.ok) {
          const savedMessage = await response.json();
          
          // Add message to local state
          const newMessageObj: Message = {
            id: savedMessage._id || Date.now().toString(),
            username: user.username,
            message: newMessage.trim(),
            timestamp: new Date().toISOString(),
            course_name: selectedCourse.course_name
          };
          
          setMessages(prev => [...prev, newMessageObj]);
          setNewMessage("");
          
          toast({
            title: "Message Sent",
            description: "Your message has been sent to the group",
          });
        } else {
          const errorData = await response.json();
          console.error("Failed to send message:", errorData);
          toast({
            title: "Error",
            description: errorData.message || "Failed to send message",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSendingMessage(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEnrolled = (courseName: string) => {
    return myCourses.some(course => course.course_name === courseName);
  };

  const isCreator = (course: Course) => {
    return user?.username === course.created_by;
  };

  const canAccessGroupChat = (course: Course | null) => {
    if (!course) return false;
    return isEnrolled(course.course_name) || isCreator(course);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            <Video className="inline w-10 h-10 mr-2" />
            Live Classes
          </h1>
          <p className="text-lg text-muted-foreground">
            Create, join, and manage live yoga and meditation courses
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Available Courses
            </TabsTrigger>
            <TabsTrigger value="my-courses" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              My Courses
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Course
            </TabsTrigger>
          </TabsList>

          {/* Available Courses Tab */}
          <TabsContent value="available" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={fetchCourses} disabled={isLoading}>
                Refresh
              </Button>
            </div>



            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-muted-foreground">No courses found</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card key={course._id} className="hover:shadow-wellness transition-wellness">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{course.course_name}</CardTitle>
                        <Badge variant={course.level === "Beginner" ? "default" : "secondary"}>
                          {course.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{course.description}</p>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {course.schedule}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {course.max_participants} max participants
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isEnrolled(course.course_name) ? (
                          <>
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => openGroupChat(course)}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Group Chat
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => leaveCourse(course.course_name)}
                              disabled={isLoading}
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button 
                            className="flex-1"
                            onClick={() => joinCourse(course.course_name)}
                            disabled={isLoading}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Join Course
                          </Button>
                        )}
                        
                        {/* Delete Course Button (only for creator) */}
                        {isCreator(course) && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${course.course_name}"? This action cannot be undone.`)) {
                                deleteCourse(course.course_name);
                              }
                            }}
                            disabled={isLoading}
                            title="Delete Course (Creator Only)"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Courses Tab */}
          <TabsContent value="my-courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Enrolled Courses</h2>
              <Button onClick={fetchMyCourses} disabled={isLoading}>
                Refresh
              </Button>
            </div>



            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading your courses...</p>
              </div>
            ) : myCourses.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-muted-foreground">You haven't joined any courses yet</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setActiveTab("available")}
                >
                  Browse Available Courses
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCourses.map((course) => (
                  <Card key={course._id} className="border-2 border-primary/20 hover:shadow-wellness transition-wellness">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{course.course_name}</CardTitle>
                        <Badge variant="default">
                          {isCreator(course) ? "Creator" : "Enrolled"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{course.description}</p>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {course.schedule}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => openGroupChat(course)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Group Chat
                        </Button>
                        {!isCreator(course) && (
                          <Button 
                            variant="destructive" 
                            onClick={() => leaveCourse(course.course_name)}
                            disabled={isLoading}
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {/* Delete Course Button (only for creator) */}
                        {isCreator(course) && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${course.course_name}"? This action cannot be undone.`)) {
                                deleteCourse(course.course_name);
                              }
                            }}
                            disabled={isLoading}
                            title="Delete Course (Creator Only)"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Create Course Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Course
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course_name">Course Name</Label>
                    <Input
                      id="course_name"
                      value={courseForm.course_name}
                      onChange={(e) => setCourseForm({...courseForm, course_name: e.target.value})}
                      placeholder="e.g., Morning Hatha Yoga"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructor">Instructor</Label>
                    <Input
                      id="instructor"
                      value={courseForm.instructor}
                      onChange={(e) => setCourseForm({...courseForm, instructor: e.target.value})}
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                    placeholder="Describe your course..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                      placeholder="e.g., 60 minutes"
                    />
                  </div>
                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select value={courseForm.level} onValueChange={(value) => setCourseForm({...courseForm, level: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="All Levels">All Levels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="max_participants">Max Participants</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      value={courseForm.max_participants}
                      onChange={(e) => setCourseForm({...courseForm, max_participants: parseInt(e.target.value)})}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="time">Start Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={courseForm.time}
                      onChange={(e) => setCourseForm({...courseForm, time: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={courseForm.endTime}
                      onChange={(e) => setCourseForm({...courseForm, endTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={courseForm.timezone} onValueChange={(value) => setCourseForm({...courseForm, timezone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IST">IST</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">EST</SelectItem>
                        <SelectItem value="PST">PST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Days of the Week</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <Button
                        key={day}
                        variant={courseForm.days.includes(day) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (courseForm.days.includes(day)) {
                            setCourseForm({
                              ...courseForm,
                              days: courseForm.days.filter(d => d !== day)
                            });
                          } else {
                            setCourseForm({
                              ...courseForm,
                              days: [...courseForm.days, day]
                            });
                          }
                        }}
                      >
                        {day.slice(0, 3)}
                      </Button>
                    ))}
                  </div>
                </div>



                <Button 
                  onClick={createCourse} 
                  disabled={isLoading || !courseForm.course_name || !courseForm.instructor || !courseForm.description || !courseForm.time || !courseForm.endTime}
                  className="w-full"
                >
                  {isLoading ? "Creating..." : "Create Course"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Group Chat Dialog */}
      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {selectedCourse?.course_name} - Group Chat
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedCourse) {
                      fetchChatMessages(selectedCourse.course_name);
                    }
                  }}
                  disabled={isChatLoading}
                >
                  {isChatLoading ? "Loading..." : "Refresh Messages"}
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col">
            {/* Enrolled Users */}
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Enrolled Users ({enrollment?.total_enrollments || 0})</h4>
              <div className="flex flex-wrap gap-2">
                {enrollment?.enrolled_users.map((username, index) => (
                  <Badge key={index} variant="secondary">
                    {username}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-3 bg-muted/50 rounded-lg">
              {isChatLoading ? (
                <div className="text-center text-muted-foreground py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading messages...</p>
                </div>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.username === user?.username ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      message.username === user?.username 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background border'
                    }`}>
                      <div className="text-xs opacity-70 mb-1">{message.username}</div>
                      <div>{message.message}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={isSendingMessage}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim() || isSendingMessage}
                >
                  {isSendingMessage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {isSendingMessage && (
                <p className="text-xs text-muted-foreground">Sending message...</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ChatBot />
    </div>
  );
}
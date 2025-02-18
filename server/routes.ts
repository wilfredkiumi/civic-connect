import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertFeedbackSchema } from "@shared/schema";
import type { IncomingMessage } from "http";
import type { SelectUser } from "@shared/schema";
import { 
  isValidCounty, 
  isValidConstituencyInCounty, 
  isValidWardInConstituency,
  getCountyByConstituency 
} from "@shared/kenya-locations";

// Extend the IncomingMessage interface to include the user property
interface AuthenticatedRequest extends IncomingMessage {
  user?: SelectUser;
}

// Maintain a list of connected clients
const clients = new Map<WebSocket, { userId: number, username: string }>();

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/leaders", async (req, res) => {
    try {
      console.log('Received leader request with params:', req.query);
      const leaders = await storage.getLocalOfficials({
        ward: req.query.ward as string,
        constituency: req.query.constituency as string,
        county: req.query.county as string,
      });
      console.log('Returning leaders:', leaders);
      res.json(leaders);
    } catch (error) {
      console.error('Error fetching leaders:', error);
      res.status(500).json({ error: "Failed to fetch leaders" });
    }
  });

  app.get("/api/leaders/:id/feedback", async (req, res) => {
    const leaderId = parseInt(req.params.id);
    const feedbacks = await storage.getFeedbackForLeader(leaderId);
    res.json(feedbacks);
  });

  app.post("/api/leaders/:id/feedback", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const leaderId = parseInt(req.params.id);
    const parsedBody = insertFeedbackSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ error: "Invalid feedback data" });
    }

    const feedback = await storage.createFeedback(req.user!.id, {
      ...parsedBody.data,
      leaderId,
    });

    res.status(201).json(feedback);
  });

  // Search endpoints
  app.get("/api/search/officials", async (req, res) => {
    const { term, location } = req.query;
    const officials = await storage.searchOfficials(
      term as string,
      location as string
    );
    res.json(officials);
  });

  app.get("/api/search/communities", async (req, res) => {
    const { term, location } = req.query;
    const communities = await storage.searchCommunities(
      term as string,
      location as string
    );
    res.json(communities);
  });

  app.get("/api/search/forums", async (req, res) => {
    const { term, category } = req.query;
    const forums = await storage.searchForums(
      term as string,
      category as string
    );
    res.json(forums);
  });

  app.get("/api/search/parliament", async (req, res) => {
    const { term, type } = req.query;
    const sessions = await storage.searchParliamentarySessions(
      term as string,
      type as string
    );
    res.json(sessions);
  });

  app.get("/api/search/projects", async (req, res) => {
    const { term, location, status } = req.query;
    const projects = await storage.searchDevelopmentProjects(
      term as string,
      location as string,
      status as string
    );
    res.json(projects);
  });

  app.patch("/api/user/location", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

app.get("/api/reports/community/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  
  const forumId = parseInt(req.params.id);
  const pdfBytes = await generateCommunityReport(forumId);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from(pdfBytes));
});


    const { ward, constituency, village } = req.body;

    try {
      // Get county based on constituency
      const county = getCountyByConstituency(constituency);
      if (!constituency || !county) {
        return res.status(400).json({
          error: "Invalid constituency name"
        });
      }

      // Validate ward if provided
      if (ward && !isValidWardInConstituency(ward, constituency)) {
        return res.status(400).json({
          error: "The specified ward does not belong to this constituency"
        });
      }

      const user = await storage.updateUserLocation(req.user!.id, {
        ward,
        constituency,
        county,
        village
      });

      res.json(user);
    } catch (error) {
      console.error('Error updating user location:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to update location"
      });
    }
  });

  app.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const { name, email, village, ward, constituency } = req.body;

    try {
      // Validate location data
      if (ward && constituency) {
        const isValidWard = validateWardInConstituency(ward, constituency);
        if (!isValidWard) {
          return res.status(400).json({
            error: "The specified ward does not belong to this constituency"
          });
        }
      }

      // Get county based on constituency
      const county = constituency ? getCountyByConstituency(constituency) : null;
      if (constituency && !county) {
        return res.status(400).json({
          error: "Invalid constituency name"
        });
      }

      const user = await storage.updateUserProfile(req.user!.id, {
        name,
        email,
        village,
        ward,
        constituency,
        county
      });

      res.json(user);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to update profile"
      });
    }
  });

  app.get("/api/user/activity", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const activity = await storage.getUserActivity(req.user!.id);
      res.json(activity);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to fetch user activity" });
    }
  });

  app.get("/api/forums/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const forumId = parseInt(req.params.id);
    const forum = await storage.getForum(forumId);

    if (!forum) {
      return res.status(404).json({ error: "Forum not found" });
    }

    res.json(forum);
  });

  app.get("/api/forums/:id/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const forumId = parseInt(req.params.id);
    const posts = await storage.getForumPosts(forumId);
    res.json(posts);
  });

  app.post("/api/forums/:id/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const forumId = parseInt(req.params.id);
    const post = await storage.createPost({
      ...req.body,
      forumId,
      authorId: req.user!.id,
    });

    res.status(201).json(post);
  });

  app.post("/api/forums/:forumId/posts/:postId/vote", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const postId = parseInt(req.params.postId);
    const { type } = req.body;

    await storage.upsertVote({
      postId,
      userId: req.user!.id,
      type,
    });

    const posts = await storage.getForumPosts(parseInt(req.params.forumId));
    res.json(posts);
  });

  app.get("/api/forums", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.sendStatus(401);
      }
      
      const forums = await storage.getForumsByLocation({
        village: req.user?.village,
        ward: req.user?.ward,
        constituency: req.user?.constituency,
        county: req.user?.county
      });
      
      res.json(forums || []);
    } catch (error) {
      console.error('Error fetching forums:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch forums" });
    }
  });

  app.get("/api/forums/village", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const forums = await storage.getForumsByLocation({
        village: req.user?.village
      });
      res.json(forums);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch village forums" });
    }
  });

  // Mock events data
  const mockEvents = [
    {
      id: 1,
      title: "Kabete Town Hall Meeting",
      description: "Monthly town hall meeting to discuss local development projects and community initiatives",
      type: "townhall",
      format: "hybrid",
      status: "upcoming",
      startTime: "2025-02-25T14:00:00Z",
      endTime: "2025-02-25T16:00:00Z",
      location: "Kabete Technical Institute Hall",
      virtualLink: "https://meet.google.com/abc-defg-hij",
      maxAttendees: 100,
      requiresRegistration: true,
      village: "Kabete",
      ward: "Kabete",
      constituency: "Kabete",
      county: "Kiambu",
    },
    {
      id: 2,
      title: "Kabete Infrastructure Forum",
      description: "Public participation forum on road improvement projects in Kabete",
      type: "public_participation",
      format: "physical",
      status: "upcoming",
      startTime: "2025-03-01T10:00:00Z",
      endTime: "2025-03-01T13:00:00Z",
      location: "Kabete Sub-County Offices",
      maxAttendees: 150,
      requiresRegistration: true,
      village: "Kabete",
      ward: "Kabete",
      constituency: "Kabete",
      county: "Kiambu",
    }
  ];

  app.get("/api/events", async (req, res) => {
    const { constituency, ward, village } = req.query;

    let filteredEvents = [...mockEvents];
    if (constituency) {
      filteredEvents = filteredEvents.filter(e => e.constituency === constituency);
    }
    if (ward) {
      filteredEvents = filteredEvents.filter(e => e.ward === ward);
    }
    if (village) {
      filteredEvents = filteredEvents.filter(e => e.village === village);
    }

    // Add registration and notification status if user is authenticated
    if (req.isAuthenticated()) {
      const userId = req.user!.id;
      filteredEvents = filteredEvents.map(event => ({
        ...event,
        isRegistered: eventRegistrations.get(`${event.id}`)?.has(userId) ?? false,
        isNotified: eventNotifications.get(`${event.id}`)?.has(userId) ?? false,
      }));
    }

    res.json(filteredEvents);
  });

  app.get("/api/reports/parliament/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  
  const sessionId = parseInt(req.params.id);
  const pdfBytes = await generateParliamentReport(sessionId);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from(pdfBytes));
});

app.get("/api/reports/project/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  
  const projectId = parseInt(req.params.id);
  const pdfBytes = await generateProjectReport(projectId);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from(pdfBytes));
});

app.post("/api/donations/mpesa/initiate", async (req, res) => {
  try {
    const { phoneNumber, amount, reference } = req.body;
    const result = await initiateSTKPush(phoneNumber, amount, reference);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to initiate MPesa payment" });
  }
});

app.post("/api/donations/mpesa/callback", async (req, res) => {
  try {
    const { Body: { stkCallback } } = req.body;
    // Store transaction details in database
    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to process callback" });
  }
});

app.post("/api/donations/verify", async (req, res) => {
    try {
      const { transaction_id } = req.body;
      
      const response = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.status === "success") {
        // Store donation record in database
        // Send thank you notification
        res.json({ status: "success" });
      } else {
        res.status(400).json({ error: "Payment verification failed" });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    const event = mockEvents.find(e => e.id === parseInt(req.params.id));
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  });

  // Track registrations and notifications (in-memory for demo)
  const eventRegistrations = new Map<string, Set<number>>();
  const eventNotifications = new Map<string, Set<number>>();

  app.post("/api/events/:id/register", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const eventId = parseInt(req.params.id);
    const userId = req.user!.id;
    const key = `${eventId}`;

    if (!eventRegistrations.has(key)) {
      eventRegistrations.set(key, new Set());
    }

    const registrations = eventRegistrations.get(key)!;
    const isRegistered = registrations.has(userId);

    if (isRegistered) {
      registrations.delete(userId);
    } else {
      registrations.add(userId);
    }

    res.json({ registered: !isRegistered });
  });

  app.post("/api/events/:id/notify", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const eventId = parseInt(req.params.id);
    const userId = req.user!.id;
    const key = `${eventId}`;

    if (!eventNotifications.has(key)) {
      eventNotifications.set(key, new Set());
    }

    const notifications = eventNotifications.get(key)!;
    const isNotified = notifications.has(userId);

    if (isNotified) {
      notifications.delete(userId);
    } else {
      notifications.add(userId);
    }

    res.json({ notified: !isNotified });
  });

  const httpServer = createServer(app);

  // Initialize WebSocket server with proper types
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req: AuthenticatedRequest) => {
    console.log('New WebSocket connection');

    // Authentication check using the session
    if (!req.user?.id) {
      ws.close(1008, 'Authentication required');
      return;
    }

    const userId = req.user.id;

    // Get user details from storage
    storage.getUser(userId).then(user => {
      if (!user) {
        ws.close(1008, 'User not found');
        return;
      }

      // Store client information
      clients.set(ws, { userId: user.id, username: user.name || 'Anonymous' });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'system',
        content: `Welcome ${user.name || 'Anonymous'}!`,
        timestamp: new Date().toISOString()
      }));

      // Broadcast user joined message
      const joinMessage = JSON.stringify({
        type: 'system',
        content: `${user.name || 'Anonymous'} joined the chat`,
        timestamp: new Date().toISOString()
      });

      broadcastMessage(joinMessage, ws);

      // Handle incoming messages
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          const clientInfo = clients.get(ws);

          if (clientInfo) {
            const formattedMessage = JSON.stringify({
              type: 'message',
              sender: clientInfo.username,
              content: message.content,
              timestamp: new Date().toISOString()
            });

            broadcastMessage(formattedMessage, null); // Send to all clients
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        const clientInfo = clients.get(ws);
        if (clientInfo) {
          const leaveMessage = JSON.stringify({
            type: 'system',
            content: `${clientInfo.username} left the chat`,
            timestamp: new Date().toISOString()
          });

          broadcastMessage(leaveMessage, null);
          clients.delete(ws);
        }
      });
    });
  });

  // Utility function to broadcast messages
  function broadcastMessage(message: string, exclude: WebSocket | null) {
    clients.forEach((_, client) => {
      if (client !== exclude && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  return httpServer;
}
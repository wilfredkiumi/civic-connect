import { useLeaders } from '@/hooks/use-leaders';
import { useAuth } from '@/hooks/use-auth';
import { Container } from '@/components/ui/container';

export function LeadersPage() {
  const { data: leaders, isLoading } = useLeaders();
  const { user } = useAuth();

  const groupedLeaders = leaders?.reduce((acc, leader) => {
    const level = leader.level;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(leader);
    return acc;
  }, {} as Record<string, typeof leaders>);

  return (
    <Container>
      <h1 className="text-3xl font-bold mb-8 text-center">Your Leaders</h1>
      
      {!user?.county ? (
        <div className="text-center p-6 bg-muted rounded-lg">
          <p className="text-muted-foreground">Please set your location to see your leaders</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center">Loading leaders...</div>
      ) : !leaders?.length ? (
        <div className="text-center p-6 bg-muted rounded-lg">
          <p className="text-muted-foreground">No leaders found for {user.ward || user.constituency || user.county}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedLeaders || {}).map(([level, levelLeaders]) => (
            <div key={level} className="space-y-4">
              <h2 className="text-2xl font-semibold capitalize">{level} Level Representatives</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {levelLeaders?.map((leader) => (
                  <div key={leader.id} className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {leader.photo ? (
                          <img 
                            src={leader.photo} 
                            alt={leader.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-2xl font-bold">{leader.name[0]}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold">{leader.name}</h3>
                        <p className="text-sm text-muted-foreground">{leader.role}</p>
                        <p className="text-sm text-muted-foreground">
                          {leader.ward || leader.constituency || leader.county}
                        </p>
                        {leader.party && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Party: {leader.party}
                          </p>
                        )}
                      </div>
                    </div>
                    {(leader.email || leader.phone) && (
                      <div className="mt-4 pt-4 border-t text-sm space-y-1">
                        {leader.email && (
                          <p className="text-muted-foreground">
                            📧 {leader.email}
                          </p>
                        )}
                        {leader.phone && (
                          <p className="text-muted-foreground">
                            📱 {leader.phone}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}

export default LeadersPage;

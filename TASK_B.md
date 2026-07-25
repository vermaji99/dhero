
# Task B: Codebase Assessment & Migration Plan

## Scenario
A working but poorly built lead management system with:
- No tests
- Business logic in route handlers
- Direct database calls from frontend
- Secrets in repository
- Real customers
- No downtime allowed

---

## A. Codebase Assessment

| Issue | Severity | Business Risk | Technical Risk | Priority | Recommended Action |
|-------|----------|---------------|----------------|----------|--------------------|
| Secrets committed to repo | Critical | Data breach, regulatory fines | Secrets exposed, account takeovers | Highest | Rotate all secrets immediately, remove from git history |
| Frontend with direct DB access | Critical | Data exfiltration, unauthorized modifications | Full DB access from client, no access control | Highest | Remove frontend DB access, build secure API layer |
| No automated tests | High | Regressions go undetected, deployment risk | No safety net for changes | High | Add critical test coverage first |
| Business logic in routes | High | Hard to test, maintain, and change | Tight coupling, no separation of concerns | High | Extract to service layer |
| Poor validation | High | Invalid data, bad user experience | Data corruption, inconsistent state | High | Implement centralized validation |
| Inconsistent error handling | Medium | Confusing user experience, hard to debug | Uncaught errors, unclear failures | Medium | Implement centralized error handling |
| No monitoring/observability | Medium | Can't detect outages or issues quickly | Blind spot for production problems | Medium | Add basic monitoring |

---

## B. Phased Migration Plan

### Week 1: Stabilization & Security
What ships:
- Secret rotation (no customer impact)
- Security fixes (rate limiting, input validation)
- Basic monitoring (error tracking, health checks)
- Critical test coverage (login, lead creation)
- Git hooks for secret scanning

What does not change:
- Core functionality
- UI
- Database schema

Risks:
- Secret rotation could break integrations → test thoroughly
- New validation could reject some valid requests → communicate to team

Rollback strategy:
- Revert to previous secret set if needed
- Disable new validation temporarily

Success criteria:
- No secrets in git
- All critical paths have tests
- Health checks pass 100%
- Error tracking is operational

---

### Month 1: Architecture Foundation
What ships:
- Business logic extracted to service layer
- Proper API boundaries established
- Frontend DB access removed (uses API instead)
- Expanded test coverage
- CI pipeline set up

What does not change:
- Database schema
- UI/UX
- Core feature set

Risks:
- API changes could break frontend → use feature flags, gradual rollout
- New service layer could have bugs → extensive testing

Rollback strategy:
- Keep old routes/DB access behind feature flags
- Can toggle back if needed

Success criteria:
- No business logic in controllers
- All frontend DB access removed
- CI runs tests on every PR
- Test coverage >50%

---

### Quarter 1: Maturity & Scalability
What ships:
- Broader architecture improvements
- Observability (metrics, tracing)
- Performance optimizations
- Engineering standards enforced
- Better deployment safety (blue/green, canary)

What does not change:
- Core product features
- API contract (backward compatible)

Risks:
- Performance changes could have regressions → A/B testing
- New standards could slow down team → gradual adoption

Rollback strategy:
- Canary deployments with fast rollback
- Metrics to detect issues early

Success criteria:
- API response time < 200ms (p95)
- Test coverage > 80%
- All PRs follow standards
- Deployments with zero downtime

---

## C. Concrete Refactoring Example

### Before (Bad Code)
```typescript
// app.ts - Route handler with business logic
app.post('/leads', async (req, res) => {
  const { fullName, email, phone, message } = req.body;

  // Poor validation
  if (!fullName || !email) {
    return res.status(400).send('Missing fields');
  }

  try {
    // Direct DB query in route
    const lead = await db.query(
      'INSERT INTO leads (full_name, email, phone, message, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [fullName, email, phone, message, 'NEW']
    );

    // Email sending in route
    await sendEmail({
      to: 'sales@example.com',
      subject: 'New lead received',
      html: `<p>New lead: ${fullName} (${email})</p>`
    });

    // Inconsistent response
    res.json(lead.rows[0]);
  } catch (error) {
    // Generic error
    res.status(500).send('Something went wrong');
  }
});
```

### After (Refactored Code)
```typescript
// leads/leads.service.ts - Business logic in service
@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async createLead(data: CreateLeadDto) {
    const lead = await this.prisma.lead.create({
      data: {
        ...data,
        status: LeadStatus.NEW,
      },
    });

    await this.emailService.sendLeadNotification(lead);
    await this.activityService.createActivity(lead.id, ActivityType.LEAD_CREATED, 'Lead created');

    return lead;
  }
}

// leads/leads.controller.ts - Thin controller
@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.createLead(createLeadDto);
  }
}

// leads/dto/create-lead.dto.ts - Centralized validation
export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}

// common/filters/http-exception.filter.ts - Centralized error handling
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus?.() || 500;
    
    response.status(status).json({
      success: false,
      error: {
        code: exception.constructor.name,
        message: exception.message || 'Internal server error',
      },
    });
  }
}
```

### Explanation
- **Controller**: Thin layer handling HTTP requests/responses
- **Service**: Contains business logic (lead creation, email, activity)
- **DTO/Validation**: Centralized input validation
- **Error Handling**: Consistent error responses across the API
- **Prisma**: Type-safe DB access, no raw queries

### Tradeoffs
- **Pros**: Better testability, maintainability, and security
- **Cons**: More files upfront, slightly more boilerplate
- **Worth It**: Long-term maintainability and scalability far outweigh the upfront cost

---

## D. Engineering Standards

### Code Structure
- **Backend**: Modular NestJS structure (modules, controllers, services, DTOs)
- **Frontend**: Feature-based folders, reusable components
- **Shared**: TypeScript types, constants, utilities

### Naming
- **Files**: kebab-case (e.g., `lead.service.ts`)
- **Classes**: PascalCase (e.g., `LeadsService`)
- **Variables**: camelCase (e.g., `fullName`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_MESSAGE_LENGTH`)
- **DB Tables/Columns**: snake_case (e.g., `full_name`)

### API Design
- **RESTful endpoints**: `/api/leads`, `/api/leads/:id`
- **HTTP Methods**: GET (read), POST (create), PATCH (update), DELETE (remove)
- **Status Codes**: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)
- **Response Format**: Consistent `{ success: boolean, data?: any, meta?: any }`

### Validation
- **Input Validation**: Class-validator/Zod for all user inputs
- **Business Rules**: Enforced in service layer
- **Sanitization**: Sanitize user inputs to prevent XSS/injection

### Error Handling
- **Centralized Filters**: NestJS exception filters
- **Consistent Responses**: Standard error format
- **Logging**: Log errors with context (user, request ID)
- **Safe Messages**: Don't expose internal errors to users

### Authentication
- **JWT**: Stateless authentication
- **Secure Storage**: Tokens in HTTP-only cookies or secure localStorage
- **Passwords**: Bcrypt hashing (10+ rounds)
- **Expiry**: Short-lived access tokens, refresh tokens

### Authorization
- **Guards**: NestJS guards for route protection
- **Roles**: Admin/Member roles with clear permissions
- **Object-Level Checks**: Verify user owns/has access to resources
- **Never Trust Frontend**: All permissions enforced on backend

### Testing
- **Unit Tests**: Test services in isolation
- **Integration Tests**: Test API endpoints
- **E2E Tests**: Critical user flows (login, lead creation)
- **Coverage**: Target >80% coverage
- **CI**: Tests run on every PR

### Pull Requests
- **Small Changes**: PRs should be <500 lines when possible
- **Description**: Explain what changed and why
- **Tests**: Include tests for new features
- **Reviews**: Require 1+ approvals before merging
- **Checks**: All tests must pass, no lint errors

### CI/CD
- **Build**: Run on every commit
- **Tests**: Run unit/integration tests
- **Linting**: Check code quality
- **Deploy**: Staging first, then production
- **Rollback**: Fast rollback option if issues

### Environment Variables
- **.env.example**: Commit example file with placeholders
- **.env**: Never commit, store in secure secrets manager
- **Validation**: Validate env vars on app startup
- **Different Envs**: Separate configs for dev/staging/prod

### Logging
- **Structured Logs**: JSON format for easy parsing
- **Levels**: Debug, Info, Warn, Error
- **Context**: Include user ID, request ID, timestamp
- **Sensitive Data**: Never log passwords, tokens, or PII

### Adoption Plan for Resistant Team
1. **Pilot**: Start with one small module (e.g., notes)
2. **Pair Programming**: Work with team members to show benefits
3. **Quick Wins**: Show improved test coverage, fewer bugs
4. **Documentation**: Create clear examples and how-to guides
5. **Gradual Rollout**: Don't force everything at once
6. **Celebrate Success**: Highlight improvements from new standards
7. **Flexibility**: Be open to feedback and adjust standards as needed

---


# AutoMapper Best Practices for Large Projects

## 🎯 **Why AutoMapper for Growing Projects**

AutoMapper is perfect for large projects because:
- **Consistency** across all modules
- **Type Safety** with compile-time validation
- **Performance** with optimized mapping
- **Maintainability** with centralized configuration
- **Scalability** for complex relationships

## 📁 **Project Structure**

```
src/
├── shared/
│   └── infrastructure/
│       └── mappers/
│           ├── base-mapper.ts          # Base mapper class
│           └── mapper-template.ts      # Template for new mappers
├── modules/
│   ├── users/
│   │   └── infrastructure/
│   │       └── mappers/
│   │           ├── user.mapper.ts      # User-specific mapper
│   │           └── prisma-user.profile.ts # AutoMapper profiles
│   └── trips/
│       └── infrastructure/
│           └── mappers/
│               ├── trip.mapper.ts
│               └── prisma-trip.profile.ts
```

## 🔧 **Best Practices**

### 1. **Use Base Mapper Class**
```typescript
// Extend BaseMapper for consistency
export class UserMapper extends BaseMapper<UserPrismaPayload, UserResponseDto> {
  protected getSourceType(): string { return 'User'; }
  protected getDestinationType(): string { return 'UserResponseDto'; }
}
```

### 2. **Organize Profiles by Module**
```typescript
// Keep profiles close to their DTOs
@Injectable()
export class PrismaUserToDtoProfile extends AutomapperProfile {
  // All user-related mappings in one place
}
```

### 3. **Use Type-Safe Payloads**
```typescript
// Define exact types for Prisma results
export type UserPrismaPayload = Prisma.UserGetPayload<typeof userSelectArgs>;
```

### 4. **Centralize Complex Transformations**
```typescript
// Handle complex logic in profiles
forMember(
  (d) => d.balance,
  mapFrom((s) => s.balance.toNumber()),
),
```

## 🚀 **Performance Tips**

### 1. **Use Select Statements**
```typescript
// Only select what you need
const userSelect = {
  id: true,
  email: true,
  roles: { select: { role: true } }
};
```

### 2. **Cache Mappings**
```typescript
// AutoMapper caches mappings automatically
// No additional configuration needed
```

### 3. **Batch Operations**
```typescript
// Use mapArray for multiple entities
const users = await this.userMapper.toDtoArray(userEntities);
```

## 📊 **Monitoring & Debugging**

### 1. **Enable Debug Mode**
```typescript
// In development
AutomapperModule.forRoot({
  strategyInitializer: pojos(),
  debug: true, // Enable in development
}),
```

### 2. **Log Mapping Operations**
```typescript
// Add logging to track performance
@Process('map-user')
async mapUser(user: User) {
  console.time('user-mapping');
  const result = this.userMapper.toDto(user);
  console.timeEnd('user-mapping');
  return result;
}
```

## 🔄 **Migration Strategy**

### Phase 1: Setup Base Infrastructure
- ✅ Base mapper class
- ✅ Template for new mappers
- ✅ User mapper implementation

### Phase 2: Migrate Existing Modules
- [ ] Trip mapper
- [ ] Vehicle mapper
- [ ] Rating mapper
- [ ] Carrier account mapper

### Phase 3: Add New Features
- [ ] Complex relationship mappings
- [ ] Conditional mappings
- [ ] Custom transformations

## 🎨 **Advanced Patterns**

### 1. **Conditional Mapping**
```typescript
forMember(
  (d) => d.displayName,
  mapFrom((s) => s.roles?.length > 0 ? s.roles[0].role : 'User'),
),
```

### 2. **Nested Object Mapping**
```typescript
forMember(
  (d) => d.vehicle,
  mapWith(VehicleSummaryDto, 'Vehicle', (s) => s.vehicle),
),
```

### 3. **Array Transformations**
```typescript
forMember(
  (d) => d.roles,
  mapWith(UserRoleDetailDto, 'UserRole', (s) => s.roles),
),
```

## 🧪 **Testing Strategy**

### 1. **Unit Tests for Mappers**
```typescript
describe('UserMapper', () => {
  it('should map user correctly', () => {
    const user = createMockUser();
    const result = userMapper.toDto(user);
    expect(result.email).toBe(user.email);
  });
});
```

### 2. **Integration Tests**
```typescript
describe('UserService with Mapper', () => {
  it('should return mapped user', async () => {
    const user = await userService.findById(1);
    expect(user).toHaveProperty('roles');
  });
});
```

## 📈 **Scaling Considerations**

### 1. **Module-Based Organization**
- Each module has its own mappers
- Shared mappers in shared folder
- Clear separation of concerns

### 2. **Performance Monitoring**
- Track mapping times
- Monitor memory usage
- Profile complex mappings

### 3. **Caching Strategy**
- AutoMapper caches automatically
- Consider Redis for distributed caching
- Implement cache invalidation

## 🎯 **Next Steps**

1. **Implement remaining mappers** using the template
2. **Add performance monitoring** for mapping operations
3. **Create comprehensive tests** for all mappers
4. **Document complex mappings** with examples
5. **Set up monitoring** for mapping performance

This structure will scale beautifully as your project grows! 🚀 
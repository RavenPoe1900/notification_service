# Prisma Module Structure

## Overview

This project now organizes Prisma models by modules while maintaining a single schema file for database operations.

## Structure

### Main Schema
- **Location**: `prisma/schema.prisma`
- **Purpose**: Contains all models and enums for the database
- **Usage**: This is the only file that Prisma reads for database operations

### Module Documentation
- **Location**: `src/modules/*/infrastructure/prisma/*.model.prisma`
- **Purpose**: Documentation and reference for each module's models
- **Usage**: These files are for reference only and are not used by Prisma

## Current Models

### Users Module
- **Documentation**: `src/modules/users/infrastructure/prisma/user.model.prisma`
- **Main Schema**: `prisma/schema.prisma` (User model)

### User-Roles Module
- **Documentation**: `src/modules/user-roles/infrastructure/prisma/user-role.model.prisma`
- **Main Schema**: `prisma/schema.prisma` (UserRole model)

## How It Works

1. **Single Source of Truth**: All models are defined in `prisma/schema.prisma`
2. **Module Documentation**: Each module has a `.prisma` file that documents its models
3. **Database Operations**: Only the main schema file is used for `prisma db push`, `prisma generate`, etc.

## Benefits

1. **Module Organization**: Models are documented within their respective modules
2. **Single Schema**: Avoids complexity of multiple schema files
3. **Clear Documentation**: Each module shows what models it owns
4. **Easy Maintenance**: Changes only need to be made in one place

## Usage

### Adding a New Model

1. **Add to main schema**: `prisma/schema.prisma`
2. **Create documentation**: `src/modules/[module]/infrastructure/prisma/[model].model.prisma`
3. **Update this documentation**: Add the new model to this file

### Database Operations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# View database
npx prisma studio
```

## Example

### Main Schema (`prisma/schema.prisma`)
```prisma
model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique
  phone         String?  @unique
  password      String   
  roles         UserRole[] 
  lastUsedRole  Role?      @map("last_used_role")
  // ... other fields
  @@map("users")
}
```

### Module Documentation (`src/modules/users/infrastructure/prisma/user.model.prisma`)
```prisma
// User Model for Prisma
// This model is defined in the main schema.prisma file
// This file serves as documentation for the users module

// Reference to the main schema:
// model User {
//   id            Int      @id @default(autoincrement())
//   email         String   @unique
//   phone         String?  @unique
//   password      String   
//   roles         UserRole[] 
//   lastUsedRole  Role?      @map("last_used_role")
//   // ... other fields
//   @@map("users")
// }
```

## Next Steps

1. **Add more models**: Follow the same pattern for new modules
2. **Update documentation**: Keep this file updated as models are added
3. **Consider automation**: Scripts could be created to sync documentation files 
import { describe, it, expect } from 'vitest';
import { AVATAR_BASE_URL, DEFAULT_AVATARS, getAvatarUrl } from '../avatars';

describe('Avatar Constants and Utilities', () => {
  describe('AVATAR_BASE_URL', () => {
    it('should have correct base URL', () => {
      // Act & Assert
      expect(AVATAR_BASE_URL).toBe('https://i.pravatar.cc/150');
    });

    it('should be a valid HTTPS URL', () => {
      // Act & Assert
      expect(AVATAR_BASE_URL).toMatch(/^https:\/\//);
    });

    it('should include image dimensions', () => {
      // Act & Assert
      expect(AVATAR_BASE_URL).toContain('150');
    });
  });

  describe('DEFAULT_AVATARS', () => {
    it('should have student01 avatar', () => {
      // Act & Assert
      expect(DEFAULT_AVATARS.student01).toBe(`${AVATAR_BASE_URL}?u=student01`);
    });

    it('should have teacher01 avatar', () => {
      // Act & Assert
      expect(DEFAULT_AVATARS.teacher01).toBe(`${AVATAR_BASE_URL}?u=teacher01`);
    });

    it('should have parent01 avatar', () => {
      // Act & Assert
      expect(DEFAULT_AVATARS.parent01).toBe(`${AVATAR_BASE_URL}?u=parent01`);
    });

    it('should have admin01 avatar', () => {
      // Act & Assert
      expect(DEFAULT_AVATARS.admin01).toBe(`${AVATAR_BASE_URL}?u=admin01`);
    });

    it('should have 4 default avatars', () => {
      // Act & Assert
      expect(Object.keys(DEFAULT_AVATARS)).toHaveLength(4);
    });

    it('should have Record<string, string> type', () => {
      // Act & Assert
      expect(typeof DEFAULT_AVATARS.student01).toBe('string');
      expect(typeof DEFAULT_AVATARS.teacher01).toBe('string');
      expect(typeof DEFAULT_AVATARS.parent01).toBe('string');
      expect(typeof DEFAULT_AVATARS.admin01).toBe('string');
    });

    it('should have const assertion', () => {
      // Act & Assert
      // The `as const` assertion ensures type safety
      expect(DEFAULT_AVATARS.student01).toBeTypeOf('string');
    });

    it('should use base URL for all default avatars', () => {
      // Act
      const avatarUrls = Object.values(DEFAULT_AVATARS);

      // Assert
      avatarUrls.forEach((url) => {
        expect(url).toContain(AVATAR_BASE_URL);
      });
    });

    it('should include user parameter in all default avatars', () => {
      // Act
      const avatarUrls = Object.values(DEFAULT_AVATARS);

      // Assert
      avatarUrls.forEach((url) => {
        expect(url).toContain('?u=');
      });
    });

    it('should have unique user IDs for each default avatar', () => {
      // Act
      const userIds = Object.keys(DEFAULT_AVATARS);

      // Assert
      expect(userIds).toEqual(['student01', 'teacher01', 'parent01', 'admin01']);
    });
  });

  describe('getAvatarUrl()', () => {
    describe('Happy Path - Valid Inputs', () => {
      it('should generate avatar URL for user ID', () => {
        // Arrange
        const userId = 'user123';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toBe(`${AVATAR_BASE_URL}?u=${userId}`);
      });

      it('should generate avatar URL for student01', () => {
        // Arrange
        const userId = 'student01';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toBe(`${AVATAR_BASE_URL}?u=student01`);
      });

      it('should generate avatar URL for teacher01', () => {
        // Arrange
        const userId = 'teacher01';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toBe(`${AVATAR_BASE_URL}?u=teacher01`);
      });

      it('should generate avatar URL for email-like user ID', () => {
        // Arrange
        const userId = 'user@example.com';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toBe(`${AVATAR_BASE_URL}?u=user%40example.com`);
      });

      it('should generate avatar URL for numeric user ID', () => {
        // Arrange
        const userId = '12345';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toBe(`${AVATAR_BASE_URL}?u=12345`);
      });

      it('should generate avatar URL for UUID-like user ID', () => {
        // Arrange
        const userId = '550e8400-e29b-41d4-a716-446655440000';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toBe(`${AVATAR_BASE_URL}?u=550e8400-e29b-41d4-a716-446655440000`);
      });

      it('should generate avatar URL for alphanumeric user ID', () => {
        // Arrange
        const userId = 'userABC123';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toBe(`${AVATAR_BASE_URL}?u=userABC123`);
      });
    });

    describe('URL Encoding', () => {
      it('should URL-encode special characters in user ID', () => {
        // Arrange
        const userId = 'user@test.com';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toContain('u=user%40test.com');
      });

      it('should URL-encode space in user ID', () => {
        // Arrange
        const userId = 'user name';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toContain('u=user%20name');
      });

      it('should URL-encode plus sign in user ID', () => {
        // Arrange
        const userId = 'user+name';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toContain('u=user%2Bname');
      });

      it('should URL-encode question mark in user ID', () => {
        // Arrange
        const userId = 'user?name';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toContain('u=user%3Fname');
      });

      it('should URL-encode hash in user ID', () => {
        // Arrange
        const userId = 'user#name';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toContain('u=user%23name');
      });

      it('should URL-encode ampersand in user ID', () => {
        // Arrange
        const userId = 'user&name';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toContain('u=user%26name');
      });

      it('should URL-encode equals sign in user ID', () => {
        // Arrange
        const userId = 'user=name';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toContain('u=user%3Dname');
      });

      it('should URL-encode percent sign in user ID', () => {
        // Arrange
        const userId = 'user%name';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toContain('u=user%25name');
      });

      it('should handle multiple special characters', () => {
        // Arrange
        const userId = 'user@test+name?with#special&chars';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toContain('u=user%40test%2Bname%3Fwith%23special%26chars');
      });

      it('should URL-encode Unicode characters', () => {
        // Arrange
        const userId = '用户123';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toContain('u=%E7%94%A8%E6%88%B7123');
      });

      it('should URL-encode emojis', () => {
        // Arrange
        const userId = 'user🎉';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toContain('u=user%F0%9F%8E%89');
      });
    });

    describe('Edge Cases - Empty and Special Values', () => {
      it('should handle empty string', () => {
        // Arrange
        const userId = '';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toBe(`${AVATAR_BASE_URL}?u=`);
      });

      it('should handle single character', () => {
        // Arrange
        const userId = 'a';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toBe(`${AVATAR_BASE_URL}?u=a`);
      });

      it('should handle long user ID (100 characters)', () => {
        // Arrange
        const userId = 'a'.repeat(100);

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toContain(`?u=${userId}`);
        expect(url.length).toBeGreaterThan(100);
      });

      it('should handle user ID with leading/trailing spaces', () => {
        // Arrange
        const userId = '  user  ';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toContain('u=%20%20user%20%20');
      });

      it('should handle user ID with only spaces', () => {
        // Arrange
        const userId = '   ';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toContain('u=%20%20%20');
      });
    });

    describe('URL Structure', () => {
      it('should include base URL in generated avatar URL', () => {
        // Arrange
        const userId = 'user123';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toContain(AVATAR_BASE_URL);
      });

      it('should include user parameter in generated avatar URL', () => {
        // Arrange
        const userId = 'user123';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toContain('?u=');
      });

      it('should have correct URL structure: BASE_URL?u=userId', () => {
        // Arrange
        const userId = 'user123';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toMatch(/^https:\/\/i\.pravatar\.cc\/150\?u=.+$/);
      });

      it('should not have any other parameters', () => {
        // Arrange
        const userId = 'user123';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        const parts = url.split('?');
        const queryParams = parts[1];
        expect(queryParams).toMatch(/^u=.+$/);
        expect(queryParams).not.toContain('&');
      });

      it('should always return string', () => {
        // Arrange
        const userId = 'user123';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(typeof url).toBe('string');
      });
    });

    describe('Consistency with DEFAULT_AVATARS', () => {
      it('should match default avatar URLs when using same user IDs', () => {
        // Arrange & Act
        const studentUrl = getAvatarUrl('student01');
        const teacherUrl = getAvatarUrl('teacher01');
        const parentUrl = getAvatarUrl('parent01');
        const adminUrl = getAvatarUrl('admin01');

        // Assert
        expect(studentUrl).toBe(DEFAULT_AVATARS.student01);
        expect(teacherUrl).toBe(DEFAULT_AVATARS.teacher01);
        expect(parentUrl).toBe(DEFAULT_AVATARS.parent01);
        expect(adminUrl).toBe(DEFAULT_AVATARS.admin01);
      });

      it('should produce identical results for identical user IDs', () => {
        // Arrange
        const userId = 'user123';

        // Act
        const url1 = getAvatarUrl(userId);
        const url2 = getAvatarUrl(userId);
        const url3 = getAvatarUrl(userId);

        // Assert
        expect(url1).toBe(url2);
        expect(url2).toBe(url3);
      });
    });

    describe('Integration with UserForm', () => {
      it('should work with email addresses as user IDs', () => {
        // Arrange
        const email = 'student@example.com';

        // Act
        const url = getAvatarUrl(email);

        // Assert
        expect(url).toContain('student%40example.com');
      });

      it('should work with generated unique IDs', () => {
        // Arrange
        const uniqueId = '550e8400-e29b-41d4-a716-446655440000';

        // Act
        const url = getAvatarUrl(uniqueId);

        // Assert
        expect(url).toContain(uniqueId);
      });

      it('should handle database IDs (numeric)', () => {
        // Arrange
        const dbId = '1234567890';

        // Act
        const url = getAvatarUrl(dbId);

        // Assert
        expect(url).toContain('u=1234567890');
      });
    });

    describe('TypeScript Type Safety', () => {
      it('should accept string parameter', () => {
        // Arrange
        const userId: string = 'user123';

        // Act
        const url = getAvatarUrl(userId);

        // Assert
        expect(url).toBeTypeOf('string');
      });

      it('should return string', () => {
        // Arrange
        const userId = 'user123';

        // Act
        const url: string = getAvatarUrl(userId);

        // Assert
        expect(typeof url).toBe('string');
      });
    });

    describe('Performance Considerations', () => {
      it('should handle repeated calls efficiently', () => {
        // Arrange
        const userId = 'user123';

        // Act
        const startTime = performance.now();
        for (let i = 0; i < 100; i++) {
          getAvatarUrl(userId);
        }
        const endTime = performance.now();

        // Assert
        const executionTime = endTime - startTime;
        expect(executionTime).toBeLessThan(10); // Should complete in < 10ms
      });

      it('should produce consistent output for same input', () => {
        // Arrange
        const userId = 'user123';
        const iterations = 10;

        // Act
        const results = [];
        for (let i = 0; i < iterations; i++) {
          results.push(getAvatarUrl(userId));
        }

        // Assert
        expect(new Set(results).size).toBe(1);
      });
    });

    describe('Real-World Usage Patterns', () => {
      it('should generate unique avatar URLs for different users', () => {
        // Arrange
        const users = ['user1', 'user2', 'user3'];

        // Act
        const urls = users.map((user) => getAvatarUrl(user));

        // Assert
        expect(new Set(urls).size).toBe(3); // All unique
      });

      it('should handle realistic user IDs from database', () => {
        // Arrange
        const realisticUserIds = [
          '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
          'student@example.com',
          'parent_of_student_123',
          'teacher.math.department',
          'admin.user.001',
        ];

        // Act
        const urls = realisticUserIds.map((id) => getAvatarUrl(id));

        // Assert
        urls.forEach((url) => {
          expect(url).toContain(AVATAR_BASE_URL);
          expect(url).toContain('?u=');
          expect(url).toMatch(/^https:\/\//);
        });
      });

      it('should maintain consistency across component renders', () => {
        // Arrange
        const userId = 'user123';

        // Act
        const url1 = getAvatarUrl(userId);
        const url2 = getAvatarUrl(userId);
        const url3 = getAvatarUrl(userId);

        // Assert
        expect(url1).toBe(url2);
        expect(url2).toBe(url3);
      });
    });
  });
});

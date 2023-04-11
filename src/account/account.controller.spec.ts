import { Test, TestingModule } from "@nestjs/testing";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";

describe("AccountController", () => {
  let controller: AccountController;
  let service: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: {
            getLoginUrl: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get<AccountService>(AccountService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
  describe("account", () => {
    it("should return the login URL", async () => {
      const result = "loginUrl";
      jest.spyOn(service, "getLoginUrl").mockImplementation(() => result);

      expect(await controller.account()).toBe(result);
    });
  });

  describe("login", () => {
    it("should redirect to the auth URL", async () => {
      const authUrl = "http://example.com/auth";
      jest
        .spyOn(controller["authClient"], "generateAuthURL")
        .mockReturnValue(authUrl);

      const res = {
        redirect: jest.fn(),
      };
      await controller.login(res);

      expect(res.redirect).toHaveBeenCalledWith(authUrl);
    });
  });

  describe("callback", () => {
    const code = "12345";
    const state = "my-state";
    const token = {
      token_type: "Bearer",
      access_token: "access_token",
      refresh_token: "refresh_token",
      expires_in: 3600,
    };
    const my_user = {
      data: {
        id: "123",
        name: "John Doe",
        username: "johndoe",
      },
    };

    it("should create an account with the user data and token", async () => {
      jest
        .spyOn(controller["authClient"], "requestAccessToken")
        .mockResolvedValue({ token: token });
      jest
        .spyOn(controller["client"].users, "findMyUser")
        .mockResolvedValue(my_user);
      jest.spyOn(service, "create").mockImplementation();

      const result = await controller.callback(code, state);

      expect(result).toBe(JSON.stringify(my_user));
      expect(controller["authClient"].requestAccessToken).toHaveBeenCalledWith(
        code
      );
      expect(controller["client"].users.findMyUser).toHaveBeenCalled();
      expect(service.create).toHaveBeenCalledWith({
        account: my_user.data.username,
        ...token,
      });
    });

    it("should throw an error if the state is not valid", async () => {
      const invalidState = "invalid-state";

      await expect(controller.callback(code, invalidState)).rejects.toThrow(
        "State is not valid"
      );
    });
  });
});
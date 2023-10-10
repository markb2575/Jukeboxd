package jukeboxd.controllers;


import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class LoginController {

  @RequestMapping(path="/login", method=RequestMethod.GET)
  public LoginResponse login(@RequestBody Map<String, Object> credentials) {
    System.out.println(credentials.get("username"));
//    if (credentials.get("username") && credentials.get("password") in database) {
//      return new LoginResponse(true);
//    }
    return new LoginResponse(false);
  }
  class LoginResponse {
    boolean success;
    LoginResponse(boolean success) {
      this.success = success;
    }
    public boolean getSuccess() {
      return success;
    }
  }
}
